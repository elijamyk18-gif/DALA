import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";

export function isValidPhoto(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;
  
  const lowerUrl = url.toLowerCase();
  
  // Explicitly allow Supabase storage URLs as they represent real user uploads
  if (lowerUrl.includes('supabase.co/storage')) return true;
  
  // Exclude Data URIs (like our DEFAULT_AVATAR) so they trigger the AvatarFallback
  if (lowerUrl.startsWith('data:')) return false;

  const placeholderPatterns = [
    'placeholder',
    'avatar-placeholder',
    'default-avatar',
    'user-icon',
    'dummy-image',
    'stock-photo',
    'generated-images',
    'pravatar.cc',
    'ui-avatars.com',
    'randomuser.me',
    'unsplash.com/photo',
    'images.unsplash.com',
    'lorempixel.com',
    'picsum.photos'
  ];
  
  return !placeholderPatterns.some(pattern => lowerUrl.includes(pattern));
}

export function getProfilePhoto(profile: any): string | null {
  if (!profile) return null;
  const photo = profile.photos?.[0] || profile.profile_photo;
  return isValidPhoto(photo) ? photo : null;
}