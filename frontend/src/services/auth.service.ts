import { supabase } from '../config/supabase.config';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth.types';

export class AuthService {
  /**
   * 用户注册 - 完整邮箱验证版本
   * @param credentials 注册凭据
   * @returns 注册结果
   */
  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      console.log('开始完整注册流程:', {
        email: credentials.email,
        username: credentials.username,
        hasPassword: !!credentials.password
      });

      const { email, password, username, full_name } = credentials;

      if (!email) {
        return {
          user: null,
          session: null,
          error: { message: '邮箱地址是必需的' } as AuthError,
        };
      }

      // 检查用户名是否已存在
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingProfile) {
        return {
          user: null,
          session: null,
          error: { message: '用户名已被使用，请选择其他用户名' } as AuthError,
        };
      }

      // 使用真实邮箱注册，启用邮箱验证
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('注册重定向URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // 设置邮箱验证重定向URL - 适配当前协议
          emailRedirectTo: redirectUrl,
          data: {
            username,
            full_name: full_name || username,
            registration_type: 'email_verification',
          },
        },
      });

      if (error) {
        console.error('注册失败:', error);
        
        // 处理常见错误
        if (error.message?.includes('User already registered')) {
          return {
            user: null,
            session: null,
            error: { ...error, message: '该邮箱已被注册，请使用其他邮箱或尝试登录' },
          };
        }
        
        if (error.message?.includes('Password should be at least')) {
          return {
            user: null,
            session: null,
            error: { ...error, message: '密码长度至少需要6位' },
          };
        }

        return {
          user: null,
          session: null,
          error,
        };
      }

      console.log('注册成功:', {
        userId: data?.user?.id,
        hasSession: !!data?.session,
        emailConfirmed: data?.user?.email_confirmed_at,
        needsVerification: !data?.session
      });

      // 如果注册成功但需要邮箱验证
      if (data?.user && !data?.session) {
        return {
          user: data.user,
          session: null,
          error: null,
          needsEmailVerification: true,
        };
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
   * 用户登录 - 支持邮箱和用户名登录
   * @param credentials 登录凭据
   * @returns 登录结果
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      let { email, password } = credentials;

      // 如果传入的是用户名格式（不包含@），需要查找对应的邮箱
      if (!email.includes('@')) {
        const username = email;
        try {
          // 从 profiles 表查找用户名对应的邮箱
          const { data: profile, error: queryError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', username)
            .single();

          if (queryError || !profile) {
            return {
              user: null,
              session: null,
              error: { message: '用户名不存在，请检查输入或使用邮箱登录' } as AuthError,
            };
          }

          email = profile.email;
          console.log('找到匹配用户，使用邮箱登录:', email);
        } catch (searchError) {
          console.error('搜索用户时出错:', searchError);
          return {
            user: null,
            session: null,
            error: { message: '查找用户信息失败，请稍后重试' } as AuthError,
          };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('登录失败:', error);
        
        // 处理常见错误
        if (error.message?.includes('Invalid login credentials')) {
          return {
            user: null,
            session: null,
            error: { ...error, message: '邮箱或密码错误，请检查后重试' },
          };
        }
        
        if (error.message?.includes('Email not confirmed')) {
          return {
            user: null,
            session: null,
            error: { ...error, message: '邮箱尚未验证，请检查邮箱并点击验证链接' },
          };
        }

        return {
          user: null,
          session: null,
          error,
        };
      }

      console.log('登录成功:', {
        userId: data?.user?.id,
        email: data?.user?.email,
        emailConfirmed: data?.user?.email_confirmed_at
      });

      return {
        user: data?.user || null,
        session: data?.session || null,
        error: null,
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

  /**
   * 重新发送验证邮件
   * @param email 邮箱地址
   * @returns 发送结果
   */
  static async resendVerificationEmail(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('重发验证邮件失败:', error);
        return { error };
      }

      console.log('验证邮件已重新发送到:', email);
      return { error: null };
    } catch (error) {
      console.error('重发验证邮件异常:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * 发送密码重置邮件
   * @param email 邮箱地址
   * @returns 发送结果
   */
  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('发送密码重置邮件失败:', error);
        return { error };
      }

      console.log('密码重置邮件已发送到:', email);
      return { error: null };
    } catch (error) {
      console.error('发送密码重置邮件异常:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * 更新密码
   * @param newPassword 新密码
   * @returns 更新结果
   */
  static async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('更新密码失败:', error);
        return { error };
      }

      console.log('密码更新成功');
      return { error: null };
    } catch (error) {
      console.error('更新密码异常:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * 验证邮箱令牌
   * @param token 验证令牌
   * @param type 令牌类型
   * @returns 验证结果
   */
  static async verifyOtp(token: string, type: 'signup' | 'recovery' = 'signup'): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type,
      });

      if (error) {
        console.error('验证令牌失败:', error);
        return {
          user: null,
          session: null,
          error,
        };
      }

      console.log('令牌验证成功:', {
        userId: data?.user?.id,
        hasSession: !!data?.session
      });

      return {
        user: data?.user || null,
        session: data?.session || null,
        error: null,
      };
    } catch (error) {
      console.error('验证令牌异常:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }
}