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
    const initAuth = async () => {
      try {
        // 获取当前会话
        const { session } = await AuthService.getSession();
        
        // 如果有会话，获取用户信息
        if (session) {
          const { user } = await AuthService.getUser();
          setState({
            user,
            session,
            loading: false,
            initialized: true,
            isAuthenticated: true
          });
        } else {
          setState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
            isAuthenticated: false
          });
        }
      } catch (error) {
        console.error('初始化身份验证失败:', error);
        setState({
          user: null,
          session: null,
          loading: false,
          initialized: true,
          isAuthenticated: false
        });
      }
    };

    initAuth();

    // 监听身份验证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          const { user } = await AuthService.getUser();
          setState({
            user,
            session,
            loading: false,
            initialized: true,
            isAuthenticated: true
          });
        } else if (event === 'SIGNED_OUT') {
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

    // 清理监听器
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // 登录方法
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setOperationLoading(true);
    const { user, session, error } = await AuthService.login(credentials);
    
    setState({
      user,
      session,
      loading: false,
      initialized: true,
      isAuthenticated: !!session
    });
    
    setOperationLoading(false);
    return { user, session, error };
  };

  // 注册方法
  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    setOperationLoading(true);
    const { user, session, error } = await AuthService.register(credentials);
    
    setState({
      user,
      session,
      loading: false,
      initialized: true,
      isAuthenticated: !!session
    });
    
    setOperationLoading(false);
    return { user, session, error };
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

  return {
    ...state,
    operationLoading, // 用于按钮状态的loading
    login,
    register,
    logout
  };
}

export default useAuth;
