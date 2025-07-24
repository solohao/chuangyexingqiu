import { createClient } from '@supabase/supabase-js';

// 从环境变量获取Supabase URL和匿名密钥
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 生产环境下移除调试日志
if (import.meta.env.DEV) {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key Length:', supabaseAnonKey ? supabaseAnonKey.length : 0);
}

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 导出Supabase URL和匿名密钥，以便在其他地方使用
export { supabaseUrl, supabaseAnonKey };
