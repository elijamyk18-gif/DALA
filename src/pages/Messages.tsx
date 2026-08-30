import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Send, Search, Phone, Video, Lock, ChevronLeft, 
  MessageCircle, ShieldCheck, Paperclip, 
  Image as ImageIcon, FileText, MapPin, UserPlus,
  Loader2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase, uploadFile } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getProfilePhoto } from '@/lib/utils';

// Components
import { CallOverlay } from '@/components/messaging/CallOverlay';
import { MessageBubble } from '@/components/messaging/MessageBubble';

export function Messages() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isContactSelectorOpen, setIsContactSelectorOpen] = useState(false);
  
  const [callState, setCallState] = useState<{ 
    isOpen: boolean, 
    type: 'voice' | 'video' | null, 
    isIncoming: boolean, 
    caller: any, 
    callId: string | null 
  }>({ 
    isOpen: false, type: null, isIncoming: false, caller: null, callId: null 
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const adminEmail = 'ofodo19@gmail.com';
  const isAdmin = profile?.role === 'admin';
  const isSubscribed = profile?.is_premium || profile?.subscription_status === 'active'; 

  // --- DATA FETCHING ---
  
  useEffect(() => {
    if (!user) return;
    async function fetchConversations() {
      setLoading(true);
      try {
        const { data: recentMessages } = await supabase
          .from('messages')
          .select('sender_id, receiver_id')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        const contactedUserIds = new Set<string>();
        recentMessages?.forEach(m => {
          if (m.sender_id !== user.id) contactedUserIds.add(m.sender_id);
          if (m.receiver_id !== user.id) contactedUserIds.add(m.receiver_id);
        });

        const incomingRecipientId = location.state?.recipientId;
        if (incomingRecipientId) contactedUserIds.add(incomingRecipientId);

        const idsArray = Array.from(contactedUserIds);
        let fetchedProfiles: any[] = [];
        if (idsArray.length > 0) {
          const { data: profiles } = await supabase.from('profiles').select('*').in('id', idsArray);
          if (profiles) fetchedProfiles = profiles;
        }

        if (fetchedProfiles.length === 0) {
          const { data: suggestions } = await supabase.from('profiles').select('*').neq('id', user.id).limit(20);
          if (suggestions) fetchedProfiles = suggestions;
        }

        setConversations(fetchedProfiles);

        if (incomingRecipientId) {
          let target = fetchedProfiles.find(p => p.id === incomingRecipientId);
          if (!target) {
             const { data: newProfile } = await supabase.from('profiles').select('*').eq('id', incomingRecipientId).single();
             if (newProfile) {
               target = newProfile;
               setConversations(prev => [newProfile, ...prev]);
             }
          }
          if (target) setSelectedChat(target);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, [user, location.state?.recipientId]);

  useEffect(() => {
    if (!user || !selectedChat) return;
    async function fetchMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedChat.id}),and(sender_id.eq.${selectedChat.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      if (!error && data) setMessages(data);
    }
    fetchMessages();

    const channelId = `chat_view_${[user.id, selectedChat.id].sort().join('_')}`;
    const chatChannel = supabase
      .channel(channelId)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
      }, (payload) => {
        const isFromChat = (payload.new.sender_id === user.id && payload.new.receiver_id === selectedChat.id) ||
                           (payload.new.sender_id === selectedChat.id && payload.new.receiver_id === user.id);
        if (isFromChat) {
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(chatChannel); };
  }, [user, selectedChat]);

  // Global channel for calls
  useEffect(() => {
    if (!user) return;

    const globalChannel = supabase
      .channel(`user_events_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'calls',
        filter: `receiver_id=eq.${user.id}`
      }, async (payload) => {
        if (payload.new.status === 'ongoing') {
          const { data: callerProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.caller_id)
            .single();
          
          setCallState({
            isOpen: true,
            type: payload.new.type,
            isIncoming: true,
            caller: callerProfile || { id: payload.new.caller_id, display_name: 'Dala Member' },
            callId: payload.new.id
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'calls',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        // If the caller cancels before we answer
        if (payload.new.status === 'completed' || payload.new.status === 'declined' || payload.new.status === 'missed') {
          if (callState.callId === payload.new.id) {
            setCallState(prev => ({ ...prev, isOpen: false }));
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(globalChannel); };
  }, [user, callState.callId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- ACTIONS ---

  const conversationLimitReached = useMemo(() => {
    if (selectedChat?.role === 'admin' || profile?.role === 'admin' || isSubscribed) return false;
    if (messages.length === 0) return false;
    
    const otherReplies = messages.filter(m => m.sender_id === selectedChat?.id).length;
    return otherReplies >= 2;
  }, [messages, isSubscribed, selectedChat, profile]);

  const handleSend = async (contentOverride?: string, attachmentData?: any) => {
    if (!user || !selectedChat) return;
    const textToSend = contentOverride || message.trim();
    if (!textToSend && !attachmentData) return;
    
    if (conversationLimitReached && !attachmentData) {
      toast.error('Subscription required to continue chatting.');
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        sender_id: user.id,
        receiver_id: selectedChat.id,
        content: textToSend || (attachmentData?.media_type === 'image' ? "Sent an image" : "Shared attachment"),
        ...attachmentData
      };

      const { error } = await supabase.from('messages').insert(payload);
      if (error) throw error;
      
      if (!contentOverride) setMessage('');
      setIsAttachmentOpen(false);
    } catch (err: any) {
      toast.error(`Failed to send message: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const initiateCall = async (type: 'voice' | 'video') => {
    if (!user || !selectedChat) return;
    
    try {
      const { data, error } = await supabase
        .from('calls')
        .insert({
          caller_id: user.id,
          receiver_id: selectedChat.id,
          type: type,
          status: 'ongoing'
        })
        .select()
        .single();

      if (error) throw error;

      setCallState({
        isOpen: true,
        type: type,
        isIncoming: false,
        caller: selectedChat,
        callId: data.id
      });
    } catch (err: any) {
      toast.error("Call failed: " + err.message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const bucket = (isImage || isVideo) ? 'media' : 'files';
      
      const { url, fileName } = await uploadFile(file, bucket, user.id);
      
      const type = isImage ? 'image' : isVideo ? 'video' : 'file';
      await handleSend(isImage ? "Sent an image" : isVideo ? "Sent a video" : `Sent file: ${fileName}`, { 
        media_url: url, 
        media_type: type, 
        file_name: fileName 
      });
      
      toast.success("File uploaded successfully");
    } catch (err: any) {
      console.error(err);
      toast.error("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const shareLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => handleSend("Shared location", { 
        media_type: 'location', 
        latitude: pos.coords.latitude, 
        longitude: pos.coords.longitude 
      }),
      () => {
        toast.error("Location permission denied. Sharing default location.");
        handleSend("Shared location", { 
          media_type: 'location', 
          latitude: -1.2921, 
          longitude: 36.8219 
        });
      }
    );
  };

  const shareContact = (targetProfile: any) => {
    handleSend(`Shared contact: ${getDisplayName(targetProfile)}`, { 
      media_type: 'contact', 
      contact_name: getDisplayName(targetProfile), 
      contact_phone: targetProfile.user_email || '+254 700 000 000' 
    });
    setIsContactSelectorOpen(false);
  };

  const getDisplayName = (target: any) => {
    if (!target) return "Dala Member";
    if (target.role === 'admin' || target.user_email === adminEmail) return "Official Support";
    return target.display_name || target.full_name || "Dala Member";
  };

  if (loading) return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="text-sm font-medium text-slate-500">Loading conversations...</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-0 md:p-4 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] max-w-7xl">
      <AnimatePresence>
        {callState.isOpen && (
          <CallOverlay 
            isOpen={callState.isOpen} 
            type={callState.type as any} 
            contact={callState.isIncoming ? callState.caller : selectedChat} 
            isIncoming={callState.isIncoming}
            callId={callState.callId}
            onEnd={() => setCallState(prev => ({ ...prev, isOpen: false, callId: null }))}
            onAccept={async () => {
              if (callState.callId) {
                await supabase.from('calls').update({ status: 'accepted' }).eq('id', callState.callId);
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isContactSelectorOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold">Share Contact</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsContactSelectorOpen(false)}>
                  <X />
                </Button>
              </div>
              <ScrollArea className="h-80">
                <div className="p-4 space-y-2">
                  {conversations.filter(p => p.id !== selectedChat?.id).map(p => (
                    <button 
                      key={p.id}
                      onClick={() => shareContact(p)}
                      className="flex items-center gap-4 w-full p-3 hover:bg-slate-50 rounded-xl transition-all group"
                    >
                      <Avatar>
                        <AvatarImage src={getProfilePhoto(p) || ""} />
                        <AvatarFallback>{getDisplayName(p).charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium flex-1 text-left">{getDisplayName(p)}</span>
                      <UserPlus className="h-5 w-5 text-slate-300 group-hover:text-orange-500" />
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

      <div className="flex h-full w-full overflow-hidden bg-white md:rounded-[2rem] md:border md:border-slate-100 md:shadow-2xl">
        {/* Sidebar */}
        <div className={`flex flex-col border-r border-slate-50 bg-slate-50/40 w-full md:w-[320px] lg:w-[380px] shrink-0 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-slate-100 bg-white">
            <h2 className="text-2xl font-black tracking-tight flex items-center justify-between">
              Dala <MessageCircle size={24} className="text-orange-500" />
            </h2>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search messages..." className="pl-10 h-11 bg-slate-100/60 border-none rounded-xl focus-visible:ring-orange-500" />
            </div>
            {!isAdmin && (
              <Button onClick={async () => {
                const { data } = await supabase.from('profiles').select('*').eq('user_email', adminEmail).single();
                if (data) { setSelectedChat(data); setConversations([data, ...conversations.filter(c => c.id !== data.id)]); }
              }} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 shadow-lg shadow-blue-200" size="sm">
                <ShieldCheck className="mr-2 h-4 w-4" /> Support Center
              </Button>
            )}
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {conversations.map((p) => (
                <button 
                  key={p.id} 
                  onClick={() => setSelectedChat(p)} 
                  className={`flex w-full items-center gap-4 rounded-2xl p-4 transition-all ${
                    selectedChat?.id === p.id 
                      ? 'bg-orange-600 text-white shadow-xl shadow-orange-200 ring-4 ring-orange-50' 
                      : 'hover:bg-white text-slate-700 active:bg-slate-100'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage src={getProfilePhoto(p) || ""} />
                      <AvatarFallback className={selectedChat?.id === p.id ? 'bg-orange-400' : 'bg-orange-100 text-orange-600'}>
                        {getDisplayName(p).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="font-bold text-sm truncate">{getDisplayName(p)}</p>
                    <p className={`text-[11px] truncate ${selectedChat?.id === p.id ? 'opacity-80' : 'text-slate-500'}`}>
                      {p.location || 'Nairobi, Kenya'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className={`flex flex-col flex-1 ${!selectedChat ? 'hidden md:flex' : 'flex'} bg-white relative`}>
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-50 p-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="md:hidden rounded-full h-9 w-9 p-0" onClick={() => setSelectedChat(null)}>
                    <ChevronLeft size={20} />
                  </Button>
                  <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-orange-50 ring-2 ring-orange-100/50">
                    <AvatarImage src={getProfilePhoto(selectedChat) || ""} />
                    <AvatarFallback className="bg-orange-500 text-white font-bold">
                      {getDisplayName(selectedChat).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm md:text-base leading-tight truncate">{getDisplayName(selectedChat)}</p>
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
                      <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Active</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 md:gap-2">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-100 hover:bg-orange-50 hover:text-orange-600" onClick={() => initiateCall('voice')}>
                    <Phone size={18} />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-100 hover:bg-orange-50 hover:text-orange-600" onClick={() => initiateCall('video')}>
                    <Video size={18} />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 px-4 py-4 bg-slate-50/30">
                <div className="space-y-4 max-w-4xl mx-auto">
                  <div className="flex justify-center mb-6">
                    <div className="bg-white/80 border border-slate-100 text-[9px] text-slate-500 font-bold px-3 py-1 rounded-full flex items-center gap-2">
                      <Lock size={10} className="text-green-500" /> ENCRYPTED
                    </div>
                  </div>
                  
                  {messages.map((msg, idx) => (
                    <MessageBubble key={msg.id || idx} msg={msg} isMe={msg.sender_id === user?.id} />
                  ))}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Footer / Input */}
              <div className="p-4 border-t border-slate-100 bg-white">
                <AnimatePresence>
                  {isAttachmentOpen && (
                    <div className="grid grid-cols-4 gap-3 mb-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      {[
                        { id: 'image', icon: ImageIcon, label: 'Photos', color: 'bg-blue-50 text-blue-600', action: () => fileInputRef.current?.click() },
                        { id: 'file', icon: FileText, label: 'Files', color: 'bg-indigo-50 text-indigo-600', action: () => fileInputRef.current?.click() },
                        { id: 'location', icon: MapPin, label: 'Place', color: 'bg-emerald-50 text-emerald-600', action: shareLocation },
                        { id: 'contact', icon: UserPlus, label: 'Contact', color: 'bg-orange-50 text-orange-600', action: () => setIsContactSelectorOpen(true) }
                      ].map(i => (
                        <button key={i.id} onClick={i.action} className="flex flex-col items-center gap-1.5">
                          <div className={`h-12 w-12 ${i.color} rounded-xl flex items-center justify-center shadow-sm`}>
                            <i.icon size={20} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600">{i.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
                
                <form className="flex gap-2 items-center" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsAttachmentOpen(!isAttachmentOpen)} 
                    className={`rounded-xl h-11 w-11 shrink-0 ${isAttachmentOpen ? 'bg-orange-600 text-white rotate-45' : 'bg-slate-100 text-slate-500'}`}
                  >
                    <Paperclip size={20} />
                  </Button>
                  
                  <div className="relative flex-1">
                    <Input 
                      placeholder={conversationLimitReached ? "Upgrade required" : "Type a message..."} 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)} 
                      disabled={conversationLimitReached || isSending || isUploading} 
                      className="rounded-xl bg-slate-100/80 border-none h-11 pl-4 pr-10 text-sm focus-visible:ring-2 focus-visible:ring-orange-500"
                    />
                    {isUploading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={conversationLimitReached || (!message.trim() && !isAttachmentOpen) || isSending || isUploading} 
                    className="rounded-xl bg-orange-600 hover:bg-orange-700 h-11 w-11 p-0 shrink-0 shadow-lg active:scale-95 transition-all"
                  >
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Send size={18} />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/30 text-center">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
                <MessageCircle size={40} className="text-orange-500 opacity-20" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Dala Messages</h3>
              <p className="text-slate-500 text-sm mt-2">Choose a contact to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}