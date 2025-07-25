import { supabase } from '../config/supabase.config';
import { UserProfile } from '../types/user.types';

export class ProfileService {
  /**
   * 获取用户资料
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('获取用户资料失败:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('获取用户资料异常:', error);
      return null;
    }
  }

  /**
   * 更新用户资料
   */
  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('更新用户资料失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('更新用户资料异常:', error);
      return false;
    }
  }

  /**
   * 上传头像
   */
  static async uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('上传头像失败:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('上传头像异常:', error);
      return null;
    }
  }
}