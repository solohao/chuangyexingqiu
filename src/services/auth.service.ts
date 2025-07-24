import { supabase } from '../config/supabase.config';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth.types';

export class AuthService {
  /**
   * 用户注册 - 黑客松简化版本
   * @param credentials 注册凭据
   * @returns 注册结果
   */
  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      console.log('开始简化注册流程:', { 
        username: credentials.username,
        hasPassword: !!credentials.password
      });
      
      const { username, password, full_name } = credentials;
      
      // 使用用户名生成有效的临时邮箱格式，避免邮件验证
      const tempEmail = `${username}@example.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email: tempEmail,
        password,
        options: {
          // 关键：禁用邮件验证
          emailRedirectTo: undefined,
          data: {
            username,
            full_name: full_name || username,
            is_temp_email: true, // 标记为临时邮箱
            registration_type: 'hackathon_simplified'
          },
        },
      });
      
      if (error) {
        console.error('注册失败:', error);
        return {
          user: null,
          session: null,
          error,
        };
      }
      
      console.log('注册成功，准备自动登录:', { 
        userId: data?.user?.id,
        hasSession: !!data?.session
      });
      
      // 如果注册成功但没有session（需要邮件验证的情况），立即登录
      if (data?.user && !data?.session) {
        console.log('执行自动登录...');
        return await this.login({
          email: tempEmail,
          password
        });
      }
      
      return {
        user: data?.user || null,
        session: data?.session || null,
        error: null,
      };
      
    } catch (error) {
      console.error('注册过程中发生异常:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * 用户登录
   * @param credentials 登录凭据
   * @returns 登录结果
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { email, password } = credentials;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return {
        user: data?.user || null,
        session: data?.session || null,
        error,
      };
    } catch (error) {
      console.error('登录失败:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * 用户登出
   * @returns 登出结果
   */
  static async logout(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('登出失败:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * 获取当前会话
   * @returns 当前会话
   */
  static async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { session: data?.session || null, error };
    } catch (error) {
      console.error('获取会话失败:', error);
      return { session: null, error: error as AuthError };
    }
  }

  /**
   * 获取当前用户
   * @returns 当前用户
   */
  static async getUser(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();
      return { user: data?.user || null, error };
    } catch (error) {
      console.error('获取用户失败:', error);
      return { user: null, error: error as AuthError };
    }
  }
}
