import { format } from 'date-fns';
import { 
  FileText, MapPin, Check, CheckCheck, UserPlus, Download 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageBubbleProps {
  msg: any;
  isMe: boolean;
}

export function MessageBubble({ msg, isMe }: MessageBubbleProps) {
  const renderContent = () => {
    if (msg.media_type === 'image') return (
      <div className="space-y-2">
        <img 
          src={msg.media_url} 
          className="rounded-lg max-h-72 w-full object-cover cursor-pointer hover:opacity-95 transition-opacity" 
          alt="Shared media" 
          onClick={() => window.open(msg.media_url, '_blank')}
        />
        {msg.content && msg.content !== "Sent an image" && <p className="text-sm leading-relaxed">{msg.content}</p>}
      </div>
    );

    if (msg.media_type === 'video') return (
      <div className="space-y-2">
        <video 
          src={msg.media_url} 
          controls 
          className="rounded-lg max-h-72 w-full object-cover"
        />
        {msg.content && msg.content !== "Sent a video" && <p className="text-sm leading-relaxed">{msg.content}</p>}
      </div>
    );

    if (msg.media_type === 'file') return (
      <div className="flex items-center gap-3 bg-black/10 p-3 rounded-xl">
        <div className="h-9 w-9 bg-white/20 rounded-lg flex items-center justify-center">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="font-bold text-[11px] truncate">{msg.file_name || 'Document'}</p>
        </div>
        <a href={msg.media_url} target="_blank" rel="noopener noreferrer" download={msg.file_name}>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-black/10">
            <Download size={12} />
          </Button>
        </a>
      </div>
    );

    if (msg.media_type === 'location') return (
      <div className="space-y-2 min-w-[180px]">
        <div className="bg-slate-200 rounded-lg h-28 flex items-center justify-center overflow-hidden relative border border-slate-300">
          <MapPin className="text-orange-600 z-10 w-7 h-7" />
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60" 
            style={{ backgroundImage: `url('https://storage.googleapis.com/dala-prod-public-storage/generated-images/17eb15e3-de4d-4d8e-b1c1-84159000da4a/map-placeholder-1562b160-1775047941551.webp')` }}
          ></div>
        </div>
        <a 
          href={`https://www.google.com/maps?q=${msg.latitude},${msg.longitude}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full"
        >
          <Button variant="secondary" size="sm" className="w-full text-[10px] font-bold py-1 h-7 rounded-lg">
            Open Map
          </Button>
        </a>
      </div>
    );

    if (msg.media_type === 'contact') return (
      <div className="bg-black/10 p-3 rounded-xl border border-white/10 flex items-center gap-3 min-w-[160px]">
        <div className="h-9 w-9 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          {(msg.contact_name || '?').charAt(0)}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="font-bold text-[11px] truncate">{msg.contact_name}</p>
          <p className="text-[9px] opacity-70">{msg.contact_phone}</p>
        </div>
      </div>
    );

    return <p className="leading-relaxed whitespace-pre-wrap text-sm">{msg.content}</p>;
  };

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-4`}>
      <div className="flex flex-col items-end max-w-[90%] md:max-w-[75%]">
        <div className={`rounded-2xl px-3.5 py-2.5 shadow-sm ${
          isMe 
            ? 'bg-orange-600 text-white rounded-tr-none shadow-orange-900/10' 
            : 'bg-white border border-slate-100 rounded-tl-none text-slate-800 shadow-slate-200/50'
        }`}>
          {renderContent()}
        </div>
        <div className="flex items-center gap-1.5 mt-1 px-1 opacity-60 transition-opacity">
          <span className="text-[9px] font-medium uppercase">{msg.created_at ? format(new Date(msg.created_at), 'HH:mm') : 'Now'}</span>
          {isMe && (
            msg.is_read ? <CheckCheck size={11} className="text-blue-500" /> : <Check size={11} className="text-slate-400" />
          )}
        </div>
      </div>
    </div>
  );
}