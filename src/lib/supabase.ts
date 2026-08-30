import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtcbylmbrydxerzqtfxp.supabase.co';
const supabaseAnonKey = 'sb_publishable_lmzBuMJBQ-iSbUqgFb4M9A_3rDg19xM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility for file uploads
export async function uploadFile(file: File, bucket: 'media' | 'files', userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return { url: publicUrl, path: data.path, fileName: file.name };
}