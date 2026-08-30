import { useState, useEffect, useRef } from 'react';
import { 
  Phone, Video, Mic, MicOff, VideoOff, PhoneOff, 
  RotateCcw, Volume2, VolumeX, PhoneIncoming, UserCircle 
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { getProfilePhoto } from '@/lib/utils';

interface CallOverlayProps {
  isOpen: boolean;
  type: 'voice' | 'video';
  contact: any;
  onEnd: () => void;
  isIncoming?: boolean;
  callId: string | null;
  onAccept: () => void;
}

export function CallOverlay({ 
  isOpen, 
  type, 
  contact, 
  onEnd, 
  isIncoming = false,
  callId,
  onAccept
}: CallOverlayProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'incoming' | 'declined' | 'completed' | 'missed'>(
    isIncoming ? 'incoming' : 'connecting'
  );
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Initialize WebRTC
  const setupWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: type === 'video', 
        audio: true 
      });
      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      peerConnection.current = new RTCPeerConnection(iceServers);
      
      stream.getTracks().forEach(track => {
        if (localStream.current && peerConnection.current) {
          peerConnection.current.addTrack(track, localStream.current);
        }
      });

      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate && callId) {
          const channel = supabase.channel(`call_signaling_${callId}`);
          channel.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: { candidate: event.candidate, from: isIncoming ? 'receiver' : 'caller' }
          });
        }
      };

      return true;
    } catch (err) {
      console.error("WebRTC Setup Error:", err);
      toast.error("Failed to access camera/microphone");
      return false;
    }
  };

  const createOffer = async () => {
    if (!peerConnection.current || !callId) return;
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    
    const channel = supabase.channel(`call_signaling_${callId}`);
    channel.send({
      type: 'broadcast',
      event: 'offer',
      payload: { sdp: offer }
    });
  };

  const createAnswer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current || !callId) return;
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    const channel = supabase.channel(`call_signaling_${callId}`);
    channel.send({
      type: 'broadcast',
      event: 'answer',
      payload: { sdp: answer }
    });
  };

  useEffect(() => {
    if (!isOpen || !callId) return;

    const signalingChannel = supabase.channel(`call_signaling_${callId}`)
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (isIncoming && peerConnection.current) {
          await createAnswer(payload.sdp);
        }
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        if (!isIncoming && peerConnection.current) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        const from = payload.from;
        const myRole = isIncoming ? 'receiver' : 'caller';
        if (from !== myRole && peerConnection.current) {
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (e) {
            console.error("Error adding ice candidate", e);
          }
        }
      })
      .subscribe();

    const dbChannel = supabase.channel(`call_db_${callId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'calls',
        filter: `id=eq.${callId}`
      }, (payload) => {
        const newStatus = payload.new.status;
        if (newStatus === 'accepted') {
          setCallStatus('connected');
          if (!isIncoming) createOffer();
        }
        if (newStatus === 'declined' || newStatus === 'completed' || newStatus === 'missed') {
          setCallStatus(newStatus);
          cleanup();
          setTimeout(onEnd, 2000);
        }
      })
      .subscribe();

    if (isIncoming) {
      setupWebRTC();
    } else {
      setupWebRTC().then(success => {
        if (success) setCallStatus('ringing');
      });
    }

    return () => {
      supabase.removeChannel(signalingChannel);
      supabase.removeChannel(dbChannel);
      cleanup();
    };
  }, [isOpen, callId]);

  const cleanup = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
  };

  useEffect(() => {
    let interval: any;
    if (isOpen && callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDecline = async () => {
    if (callId) {
      await supabase.from('calls').update({ status: 'declined' }).eq('id', callId);
    }
    onEnd();
  };

  const handleEnd = async () => {
    if (callId) {
      await supabase.from('calls').update({ status: 'completed', duration: callDuration }).eq('id', callId);
    }
    onEnd();
  };

  const handleAcceptLocal = async () => {
    if (callId) {
      await supabase.from('calls').update({ status: 'accepted' }).eq('id', callId);
    }
    onAccept();
    setCallStatus('connected');
  };

  const toggleMute = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl"
    >
      <div className="relative w-full h-full md:max-w-md md:h-[80vh] overflow-hidden md:rounded-[3rem] bg-slate-900 shadow-2xl flex flex-col items-center">
        {type === 'video' && (
          <div className="absolute inset-0 z-0 bg-slate-800">
            {callStatus === 'connected' ? (
              <div className="w-full h-full relative">
                 <video 
                   ref={remoteVideoRef} 
                   autoPlay 
                   playsInline 
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/40"></div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <UserCircle className="w-32 h-32 text-slate-700 animate-pulse" />
              </div>
            )}
            
            <div className="absolute top-8 right-6 w-28 h-40 bg-slate-800 rounded-2xl border border-white/10 overflow-hidden shadow-2xl z-20">
               <video 
                 ref={localVideoRef} 
                 autoPlay 
                 muted 
                 playsInline 
                 className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`} 
               />
               {isVideoOff && (
                 <div className="w-full h-full flex items-center justify-center bg-slate-700 text-slate-500">
                    <VideoOff size={32} />
                 </div>
               )}
            </div>
          </div>
        )}

        <div className="relative z-10 w-full pt-20 px-8 text-center">
           {type === 'voice' && (
              <div className="flex flex-col items-center mb-8">
                 <div className="relative">
                   <div className={`absolute inset-0 rounded-full bg-orange-500/20 ${callStatus !== 'connected' ? 'animate-ping' : ''}`}></div>
                   <Avatar className="w-32 h-32 border-4 border-slate-800 shadow-2xl relative z-10">
                      <AvatarImage src={getProfilePhoto(contact) || ''} />
                      <AvatarFallback className="bg-orange-500 text-white text-4xl font-bold">
                         {(contact?.display_name || contact?.full_name || '?').charAt(0)}
                      </AvatarFallback>
                   </Avatar>
                 </div>
              </div>
           )}
           <h2 className="text-2xl font-bold text-white mb-2">{contact?.display_name || contact?.full_name || 'Dala Member'}</h2>
           <div className="flex flex-col items-center gap-1">
             <p className="text-orange-400 font-bold tracking-widest text-[10px] uppercase flex items-center gap-2">
               {callStatus === 'connecting' && <><RotateCcw size={12} className="animate-spin" /> Connecting...</>}
               {callStatus === 'ringing' && <><Volume2 size={12} className="animate-pulse" /> Ringing...</>}
               {callStatus === 'incoming' && <><PhoneIncoming size={12} className="animate-bounce" /> Incoming {type} call...</>}
               {callStatus === 'connected' && <><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Ongoing Session</>}
               {callStatus === 'declined' && <span className="text-rose-500">Call Declined</span>}
               {callStatus === 'completed' && <span className="text-slate-400">Call Ended</span>}
               {callStatus === 'missed' && <span className="text-amber-500">Call Missed</span>}
             </p>
             {callStatus === 'connected' && (
               <p className="text-white text-lg font-mono mt-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">{formatDuration(callDuration)}</p>
             )}
           </div>
        </div>

        <div className="relative z-10 w-full mt-auto mb-12 px-8">
           {callStatus === 'incoming' ? (
             <div className="flex items-center justify-around gap-8">
                <button 
                  onClick={handleDecline}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white shadow-xl shadow-rose-900/40 active:scale-95 transition-all"
                >
                  <PhoneOff size={28} />
                </button>
                <button 
                  onClick={handleAcceptLocal}
                  className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-white shadow-xl shadow-green-900/40 active:scale-95 transition-all animate-bounce"
                >
                  <Phone size={28} />
                </button>
             </div>
           ) : (
             <div className="bg-slate-800/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-4 flex items-center justify-around shadow-2xl">
                <button 
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-700/50 text-slate-300'}`}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                {type === 'video' && (
                  <button 
                    onClick={toggleVideo}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-700/50 text-slate-300'}`}
                  >
                    {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                  </button>
                )}
                <button 
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${!isSpeakerOn ? 'bg-slate-600 text-white' : 'bg-slate-700/50 text-slate-300'}`}
                >
                  {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
                <button 
                  onClick={handleEnd}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white shadow-xl shadow-rose-900/40 active:scale-95 transition-all -mt-4 border-4 border-slate-900"
                >
                  <PhoneOff size={28} />
                </button>
             </div>
           )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900/90 pointer-events-none z-[5]"></div>
      </div>
    </motion.div>
  );
}