import { supabase } from '../config/supabase.config';
import { UserProfile } from '../types/user.types';
import { Tables } from '../types/supabase.types';

export class ProfileService {
  /**
   * 获取用户资料
   * @param userId 用户ID
   * @returns 用户资料
   */
  static async getProfile(userId: string): Promise<{ profile: UserProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return {
        profile: data as UserProfile,
        error
      };
    } catch (error) {
      console.error('获取用户资料失败:', error);
      return {
        profile: null,
        error
      };
    }
  }

  /**
   * 更新用户资料
   * @param userId 用户ID
   * @param profile 用户资料
   * @returns 更新后的用户资料
   */
  static async updateProfile(userId: string, profile: Partial<Tables<'profiles'>>): Promise<{ profile: UserProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', userId)
        .select('*')
        .single();

      return {
        profile: data as UserProfile,
        error
      };
    } catch (error) {
      console.error('更新用户资料失败:', error);
      return {
        profile: null,
        error
      };
    }
  }

  /**
   * 上传用户头像
   * @param userId 用户ID
   * @param file 头像文件
   * @returns 头像URL
   */
  static async uploadAvatar(userId: string, file: File): Promise<{ avatarUrl: string | null; error: any }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 上传文件
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 获取公共URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 更新用户资料
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      return {
        avatarUrl: data.publicUrl,
        error: null
      };
    } catch (error) {
      console.error('上传头像失败:', error);
      return {
        avatarUrl: null,
        error
      };
    }
  }
} 