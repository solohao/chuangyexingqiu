import { supabase } from '../config/supabase.config';
import { APP_CONFIG } from '../config/app.config';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth.types';

export class AuthService {
  /**
   * 用户注册
   * @param credentials 注册凭据
   * @returns 注册结果
   */
  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      console.log('开始注册流程，准备提交数据:', { 
        email: credentials.email, 
        hasPassword: !!credentials.password,
        username: credentials.username,
        hasFullName: !!credentials.full_name
      });
      
      const { email, password, username, full_name } = credentials;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: APP_CONFIG.getAuthCallbackUrl(),
          data: {
            username,
            full_name: full_name || username,
          },
        },
      });
      
      if (error) {
        console.error('注册失败，Supabase返回错误:', error);
      } else {
        console.log('注册成功，返回数据:', { 
          userId: data?.user?.id,
          hasSession: !!data?.session
        });
      }
      
      return {
        user: data?.user || null,
        session: data?.session || null,
        error,
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
