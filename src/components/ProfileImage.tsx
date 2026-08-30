import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileImageProps {
  url?: string | null;
  name?: string;
  className?: string;
  iconClassName?: string;
  placeholderText?: string;
}

export function ProfileImage({ 
  url, 
  name, 
  className, 
  iconClassName,
  placeholderText = "No Photo Shared"
}: ProfileImageProps) {
  // Only render the image if a specific profile photo URL is provided
  if (url) {
    return (
      <img
        src={url}
        alt={name || 'Profile'}
        className={cn('h-full w-full object-cover', className)}
      />
    );
  }

  // Generic placeholder logic
  const initials = name 
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : null;

  return (
    <div className={cn('flex flex-col items-center justify-center bg-slate-50 text-slate-300 w-full h-full p-4', className)}>
      {initials ? (
        <div className="flex flex-col items-center">
          <div className="text-4xl md:text-6xl font-black text-slate-200 tracking-tighter mb-2">
            {initials}
          </div>
          {placeholderText && (
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-center">
              {placeholderText}
            </span>
          )}
        </div>
      ) : (
        <>
          <User className={cn('h-20 w-20 opacity-20', iconClassName)} />
          {placeholderText && (
            <span className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-40 text-center">
              {placeholderText}
            </span>
          )}
        </>
      )}
    </div>
  );
}