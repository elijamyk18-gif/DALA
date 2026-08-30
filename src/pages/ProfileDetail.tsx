import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Heart,
  MessageCircle,
  Award,
  Briefcase,
  Users,
  ChevronLeft,
  Camera,
  Video,
  Plus,
  Trash2,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { UserMedia, Profile } from '@/types';
import { cn, DEFAULT_AVATAR, getProfilePhoto } from '@/lib/utils';

export function ProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwnProfile = user?.id === id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [media, setMedia] = useState<UserMedia[]>([]);
  const [userLikes, setUserLikes] = useState<string[]>([]); 
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<UserMedia | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProfileData() {
      if (!id) return;
      setLoading(true);
      
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (profileError) throw profileError;
        setProfile(profileData);

        const { data: mediaData, error: mediaError } = await supabase
          .from('user_media')
          .select('*')
          .eq('profile_id', id)
          .order('created_at', { ascending: false });
        
        if (mediaError) throw mediaError;
        setMedia(mediaData || []);

        if (user) {
          const { data: likesData } = await supabase
            .from('media_likes')
            .select('media_id')
            .eq('user_id', user.id);
          
          if (likesData) {
            setUserLikes(likesData.map(l => l.media_id));
          }

          if (!isOwnProfile) {
            const { data: profileLikeData } = await supabase
              .from('profile_likes')
              .select('*')
              .eq('profile_id', id)
              .eq('user_id', user.id)
              .single();
            setIsLiked(!!profileLikeData);
          }
        }

        if (!isOwnProfile) {
          await supabase.rpc('increment_profile_views', { profile_id: id });
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [id, user, isOwnProfile]);

  const handleLike = async () => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }
    if (isOwnProfile) return;

    const newLikedStatus = !isLiked;
    setIsLiked(newLikedStatus);

    try {
      if (newLikedStatus) {
        await supabase.from('profile_likes').insert({ profile_id: id, user_id: user.id });
        await supabase.rpc('increment_profile_likes', { profile_id: id });
      } else {
        await supabase.from('profile_likes').delete().eq('profile_id', id).eq('user_id', user.id);
        await supabase.rpc('decrement_profile_likes', { profile_id: id });
      }
      
      const { data } = await supabase.from('profiles').select('likes_count').eq('id', id).single();
      if (data && profile) setProfile({ ...profile, likes_count: data.likes_count });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleMediaLike = async (mediaItem: UserMedia) => {
    if (!user) return;
    const isMediaLiked = userLikes.includes(mediaItem.id);
    
    try {
      if (!isMediaLiked) {
        await supabase.from('media_likes').insert({ media_id: mediaItem.id, user_id: user.id });
        await supabase.rpc('increment_media_likes', { target_media_id: mediaItem.id });
        setUserLikes([...userLikes, mediaItem.id]);
        setMedia(media.map(m => m.id === mediaItem.id ? { ...m, likes_count: (m.likes_count || 0) + 1 } : m));
      } else {
        await supabase.from('media_likes').delete().eq('media_id', mediaItem.id).eq('user_id', user.id);
        await supabase.rpc('decrement_media_likes', { target_media_id: mediaItem.id });
        setUserLikes(userLikes.filter(id => id !== mediaItem.id));
        setMedia(media.map(m => m.id === mediaItem.id ? { ...m, likes_count: Math.max(0, (m.likes_count || 0) - 1) } : m));
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleMessage = () => {
    if (isOwnProfile) return;
    navigate('/messages', { state: { recipientId: id } });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);

      const { data: newMedia, error: insertError } = await supabase
        .from('user_media')
        .insert({
          profile_id: user.id,
          url: publicUrl,
          media_type: type,
          is_private: false,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setMedia([newMedia, ...media]);
      toast.success(`${type} uploaded!`);
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaItem: UserMedia) => {
    if (!isOwnProfile) return;
    try {
      const { error } = await supabase.from('user_media').delete().eq('id', mediaItem.id);
      if (error) throw error;
      setMedia(media.filter(m => m.id !== mediaItem.id));
      toast.success('Removed');
    } catch (err: any) {
      toast.error('Failed to remove');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center px-4">
        <Sparkles className="h-12 w-12 text-orange-200 mb-4" />
        <h2 className="text-2xl font-bold">Not Found</h2>
        <Button variant="sunrise" className="mt-6 rounded-xl" onClick={() => navigate('/discover')}>Back</Button>
      </div>
    );
  }

  const name = profile.display_name || profile.full_name || 'User';
  const photos = media.filter(m => m.media_type === 'photo');
  const videos = media.filter(m => m.media_type === 'video');

  const validPhoto = getProfilePhoto(profile);
  const profileImage = validPhoto || DEFAULT_AVATAR;

  return (
    <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-8 max-w-6xl">
      <div className="mb-4 sm:mb-6 px-4 sm:px-0 flex items-center justify-between">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {isOwnProfile && (
          <Link to="/onboarding">
            <Button variant="outline" size="sm" className="border-orange-200 text-orange-600">Edit</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
        {/* Sidebar - Profile Header */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden border-0 sm:border border-slate-100 shadow-2xl bg-white sm:rounded-[2rem]">
            <div className="relative aspect-[4/5] bg-slate-50 flex items-center justify-center overflow-hidden">
              <img 
                src={profileImage}
                alt={name}
                className={cn(
                  "h-full w-full object-cover",
                  !validPhoto && "p-24 opacity-10"
                )} 
              />
              <div className="absolute top-4 right-4">
                <div className="rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-black tracking-widest text-slate-900 shadow-sm backdrop-blur-md">
                  {isOwnProfile ? 'YOU' : 'MEMBER'}
                </div>
              </div>
              {!validPhoto && (
                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No Photo Shared</span>
                </div>
              )}
            </div>
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">{name}, {profile.age}</h1>
                  <p className="flex items-center text-xs text-slate-400 mt-1 font-bold">
                    <MapPin className="mr-1 h-3 w-3 text-orange-500" /> {profile.location || 'Unknown'}
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-center">
                  <div>
                    <p className="text-lg font-black">{profile.likes_count || 0}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Likes</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                {!isOwnProfile && (
                  <>
                    <Button variant="sunrise" className="flex-1 h-12 rounded-xl text-base font-bold" onClick={handleMessage}>
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Chat
                    </Button>
                    <Button
                      variant={isLiked ? 'default' : 'outline'}
                      size="icon"
                      className={cn("h-12 w-12 rounded-xl", isLiked ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-100')}
                      onClick={handleLike}
                    >
                      <Heart className={cn("h-5 w-5", isLiked && 'fill-current')} />
                    </Button>
                  </>
                )}
                {isOwnProfile && (
                  <Button variant="sunrise" className="flex-1 h-12 rounded-xl" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="mr-2 h-5 w-5" />
                    Add Content
                  </Button>
                )}
              </div>

              <div className="mt-8 space-y-4 border-t border-slate-50 pt-6">
                {[ 
                  { icon: Users, label: 'Seeking', value: Array.isArray(profile.seeking_types) ? profile.seeking_types.join(', ') : (profile.seeking_types || 'Belonging'), color: 'orange' },
                  { icon: Award, label: 'Ethnicity', value: profile.ethnicity || 'Not specified', color: 'rose' },
                  { icon: Briefcase, label: 'Work', value: profile.occupation || 'Not specified', color: 'blue' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center text-xs">
                    <div className={`mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-${item.color}-50`}>
                      <item.icon className={`h-4 w-4 text-${item.color}-500`} />
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">{item.label}</p>
                      <p className="font-bold text-slate-800 truncate max-w-[150px]">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8 px-4 sm:px-0 pb-12">
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">About</h2>
            <div className="rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-50">
              <p className="text-base md:text-lg leading-relaxed text-slate-600 italic font-medium">
                "{profile.about_me || profile.bio || 'Sharing my story soon...'}"
              </p>
            </div>
          </section>

          {/* Photos Gallery */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-black text-slate-900">Photos</h2>
              {isOwnProfile && (
                <div className="flex gap-2">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'photo')} />
                  <Button variant="outline" size="sm" className="rounded-full h-9 border-slate-200" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
              {photos.length > 0 ? photos.map((m) => (
                <motion.div
                  key={m.id}
                  whileHover={{ scale: 1.02 }}
                  className="group relative aspect-square overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer bg-slate-100 shadow-md"
                  onClick={() => setSelectedMedia(m)}
                >
                  <img src={m.url} alt="Photo" className="h-full w-full object-cover" />
                  {isOwnProfile && (
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteMedia(m); }} className="absolute top-2 right-2 p-1.5 sm:p-2 bg-rose-500 text-white rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shadow-lg">
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  )}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white bg-black/40 px-2 py-0.5 rounded-full text-[9px] backdrop-blur-sm">
                    <Heart className={cn("h-2.5 w-2.5", userLikes.includes(m.id) && "fill-rose-500 text-rose-500")} />
                    <span className="font-bold">{m.likes_count || 0}</span>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 bg-white">
                  <Camera className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-xs font-bold">No photos yet</p>
                </div>
              )}
            </div>
          </section>

          {/* Videos Gallery */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-black text-slate-900">Videos</h2>
              {isOwnProfile && (
                <div className="flex gap-2">
                  <input type="file" accept="video/*" className="hidden" ref={videoInputRef} onChange={(e) => handleFileUpload(e, 'video')} />
                  <Button variant="outline" size="sm" className="rounded-full h-9 border-slate-200" onClick={() => videoInputRef.current?.click()} disabled={uploading}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.length > 0 ? videos.map((m) => (
                <motion.div
                  key={m.id}
                  className="group relative aspect-video overflow-hidden rounded-2xl sm:rounded-3xl bg-black shadow-lg cursor-pointer"
                  onClick={() => setSelectedMedia(m)}
                >
                  <video src={m.url} className="h-full w-full object-contain" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="rounded-full bg-white/20 p-3 backdrop-blur-md">
                      <Video className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteMedia(m); }} className="absolute top-3 right-3 p-2 bg-rose-500 text-white rounded-full transition-all shadow-lg">
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  )}
                </motion.div>
              )) : (
                <div className="col-span-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 bg-white">
                  <Video className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-xs font-bold">No videos yet</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Media Viewer Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-2 sm:p-10 backdrop-blur-sm"
            onClick={() => setSelectedMedia(null)}
          >
            <button className="absolute top-4 right-4 text-white p-3 bg-white/10 rounded-full z-10" onClick={() => setSelectedMedia(null)}>
              <X className="h-6 w-6" />
            </button>
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-h-full max-w-full overflow-hidden flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative max-w-5xl">
                {selectedMedia.media_type === 'photo' ? (
                  <img src={selectedMedia.url} alt="Large view" className="max-h-[85vh] w-auto object-contain rounded-xl shadow-2xl" />
                ) : (
                  <video src={selectedMedia.url} controls autoPlay className="max-h-[85vh] w-full rounded-xl shadow-2xl" />
                )}
                
                <div className="mt-3 flex items-center justify-between text-white w-full bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                  <button onClick={() => handleMediaLike(selectedMedia)} className={cn("flex items-center gap-2 px-5 py-2 rounded-full transition-all active:scale-95", userLikes.includes(selectedMedia.id) ? "bg-rose-500" : "bg-white/20")}>
                    <Heart className={cn("h-5 w-5", userLikes.includes(selectedMedia.id) && "fill-current")} />
                    <span className="font-bold">{selectedMedia.likes_count || 0}</span>
                  </button>
                  {!isOwnProfile && (
                    <Button variant="sunrise" size="sm" className="rounded-full h-10 px-6" onClick={handleMessage}>
                      Chat
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}