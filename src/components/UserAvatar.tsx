import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  profile?: {
    display_name?: string;
    full_name?: string;
    profile_photo?: string;
    photos?: string[];
    role?: string;
    user_email?: string;
  } | null;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ profile, className, fallbackClassName }: UserAvatarProps) {
  const adminEmail = 'ofodo19@gmail.com';
  
  const getDisplayName = (target: any) => {
    if (!target) return "Dala Member";
    if (target.role === 'admin' || target.user_email === adminEmail) return "Official Support";
    return target.display_name || target.full_name || "Dala Member";
  };

  const displayName = getDisplayName(profile);
  const initials = displayName.charAt(0).toUpperCase();
  
  // Strictly use profile_photo only, do not fallback to general photos array
  // This ensures no "real image" is used unless explicitly set as the profile photo
  const photoUrl = profile?.profile_photo;

  return (
    <Avatar className={cn('border border-slate-100 bg-slate-50', className)}>
      {photoUrl ? (
        <AvatarImage src={photoUrl} alt={displayName} />
      ) : null}
      <AvatarFallback className={cn('bg-orange-100 text-orange-600 font-bold', fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}