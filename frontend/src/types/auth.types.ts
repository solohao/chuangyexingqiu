import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  operationLoading: boolean; // 用于按钮状态的loading
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<{ error: any }>;
  resendVerificationEmail: (email: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string; // 必需，用于邮箱验证
  password: string;
  username: string;
  full_name?: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: any;
  needsEmailVerification?: boolean; // 是否需要邮箱验证
}
