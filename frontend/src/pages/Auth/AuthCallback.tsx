import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../config/supabase.config';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 获取URL中的参数
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type') as 'signup' | 'recovery' | null;
        const next = searchParams.get('next') || '/';

        if (!token_hash || !type) {
          setStatus('error');
          setMessage('验证链接无效或已过期');
          return;
        }

        // 验证令牌
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type,
        });

        if (error) {
          console.error('验证失败:', error);
          setStatus('error');
          
          if (error.message?.includes('expired')) {
            setMessage('验证链接已过期，请重新申请');
          } else if (error.message?.includes('invalid')) {
            setMessage('验证链接无效，请检查邮箱中的最新链接');
          } else {
            setMessage('验证失败，请稍后重试');
          }
          return;
        }

        if (data.user && data.session) {
          console.log('验证成功:', {
            userId: data.user.id,
            email: data.user.email,
            type
          });

          setStatus('success');
          
          if (type === 'signup') {
            setMessage('邮箱验证成功！欢迎加入创业星球');
          } else if (type === 'recovery') {
            setMessage('邮箱验证成功！请设置新密码');
          }

          // 延迟跳转，让用户看到成功消息
          setTimeout(() => {
            if (type === 'recovery') {
              navigate('/auth/reset-password');
            } else {
              navigate(next);
            }
          }, 2000);
        } else {
          setStatus('error');
          setMessage('验证过程中出现问题，请稍后重试');
        }
      } catch (error) {
        console.error('处理验证回调时出错:', error);
        setStatus('error');
        setMessage('验证过程中出现异常，请稍后重试');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <Loader className="mx-auto h-12 w-12 text-primary-600 animate-spin" />
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  正在验证...
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  请稍候，我们正在验证您的邮箱
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  验证成功！
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {message}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  正在跳转...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="mx-auto h-12 w-12 text-red-600" />
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  验证失败
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {message}
                </p>
                <button
                  onClick={handleRetry}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  返回登录
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;