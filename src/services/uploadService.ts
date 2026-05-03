
import { supabase } from '../supabase';

export const uploadService = {
  uploadImage: async (file: File, bucket: string = 'images'): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw new Error('فشل في رفع الصورة');
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
