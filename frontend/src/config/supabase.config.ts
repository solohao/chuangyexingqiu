import { createClient } from '@supabase/supabase-js';

// 从环境变量获取Supabase URL和匿名密钥
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 开发环境下的基本配置验证
if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Supabase 配置缺失，请检查环境变量');
}

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 开发环境配置
    ...(import.meta.env.DEV && {
      redirectTo: 'http://localhost:3000/auth/callback',
      flowType: 'pkce'
    })
  }
});

// 导出Supabase URL和匿名密钥，以便在其他地方使用
export { supabaseUrl, supabaseAnonKey };
