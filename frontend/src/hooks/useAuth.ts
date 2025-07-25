import { useEffect, useState } from 'react';
import { AuthService } from '../services/auth.service';
import { supabase } from '../config/supabase.config';
import { AuthState, LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth.types';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true, // 这个loading用于初始化
    initialized: false,
    isAuthenticated: false
  });
  
  // 单独的操作loading状态
  const [operationLoading, setOperationLoading] = useState(false);

  // 初始化身份验证状态
  useEffect(() => {
    // 设置超时机制，确保 loading 状态不会一直为 true
    let timeout = setTimeout(() => {
      setState(prev => {
        if (!prev.initialized) {
          return {
            ...prev,
            loading: false,
            initialized: true,
            isAuthenticated: false
          };
        }
        return prev;
      });
    }, 3000); // 3秒超时

    // 监听身份验证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session, session?.user?.id);
        
        // 清除超时，因为我们收到了认证状态变化
        clearTimeout(timeout);
        
        try {
          if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
            console.log('处理登录状态，事件:', event);
            
            // 直接使用 session 中的用户信息，避免额外的 API 调用
            const user = session.user;
            console.log('设置登录状态:', { userId: user?.id, hasSession: !!session });
            
            setState({
              user,
              session,
              loading: false,
              initialized: true,
              isAuthenticated: true
            });
          } else if (event === 'SIGNED_OUT') {
            console.log('设置登出状态');
            setState({
              user: null,
              session: null,
              loading: false,
              initialized: true,
              isAuthenticated: false
            });
          } else if (event === 'TOKEN_REFRESHED' && session) {
            console.log('刷新令牌');
            setState(prev => ({
              ...prev,
              session,
              user: session.user,
              isAuthenticated: true
            }));
          } else {
            // 处理其他情况，确保初始化完成
            console.log('其他认证事件:', event, '设置为未登录状态');
            setState(prev => ({
              ...prev,
              loading: false,
              initialized: true,
              isAuthenticated: false
            }));
          }
        } catch (error) {
          console.error('处理认证状态变化时出错:', error);
          setState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
            isAuthenticated: false
          });
        }
      }
    );

    // 清理监听器和超时
    return () => {
      clearTimeout(timeout);
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // 登录方法
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setOperationLoading(true);
    try {
      const { user, session, error } = await AuthService.login(credentials);
      
      // 如果登录成功，立即更新状态，不等待监听器
      if (user && session && !error) {
        console.log('登录成功，立即更新状态');
        setState({
          user,
          session,
          loading: false,
          initialized: true,
          isAuthenticated: true
        });
      }
      
      setOperationLoading(false);
      return { user, session, error };
    } catch (error) {
      setOperationLoading(false);
      return { user: null, session: null, error: error as any };
    }
  };

  // 注册方法
  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    setOperationLoading(true);
    try {
      const { user, session, error } = await AuthService.register(credentials);
      
      // 如果注册成功，立即更新状态，不等待监听器
      if (user && session && !error) {
        console.log('注册成功，立即更新状态');
        setState({
          user,
          session,
          loading: false,
          initialized: true,
          isAuthenticated: true
        });
      }
      
      setOperationLoading(false);
      return { user, session, error };
    } catch (error) {
      setOperationLoading(false);
      return { user: null, session: null, error: error as any };
    }
  };

  // 登出方法
  const logout = async () => {
    setOperationLoading(true);
    const { error } = await AuthService.logout();
    
    if (!error) {
      setState({
        user: null,
        session: null,
        loading: false,
        initialized: true,
        isAuthenticated: false
      });
    }
    
    setOperationLoading(false);
    return { error };
  };

  // 重新发送验证邮件
  const resendVerificationEmail = async (email: string) => {
    setOperationLoading(true);
    const { error } = await AuthService.resendVerificationEmail(email);
    setOperationLoading(false);
    return { error };
  };

  // 重置密码
  const resetPassword = async (email: string) => {
    setOperationLoading(true);
    const { error } = await AuthService.resetPassword(email);
    setOperationLoading(false);
    return { error };
  };

  // 更新密码
  const updatePassword = async (newPassword: string) => {
    setOperationLoading(true);
    const { error } = await AuthService.updatePassword(newPassword);
    setOperationLoading(false);
    return { error };
  };

  return {
    ...state,
    operationLoading, // 用于按钮状态的loading
    login,
    register,
    logout,
    resendVerificationEmail,
    resetPassword,
    updatePassword
  };
}

export default useAuth;
