import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../config/supabase.config';
import { Globe, CheckCircle, XCircle, Loader } from 'lucide-react';

const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 获取URL中的认证参数 - 支持hash和search参数
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const accessToken = searchParams.get('access_token') || urlParams.get('access_token') || hashParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token') || urlParams.get('refresh_token') || hashParams.get('refresh_token');
        const type = searchParams.get('type') || urlParams.get('type') || hashParams.get('type');
        const error = searchParams.get('error') || urlParams.get('error') || hashParams.get('error');
        const errorDescription = searchParams.get('error_description') || urlParams.get('error_description') || hashParams.get('error_description');
        
        console.log('Auth callback params:', { type, hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken, error });
        
        if (error) {
          console.error('Auth callback error:', error, errorDescription);
          setStatus('error');
          let friendlyMessage = '验证失败';
          
          if (error === 'access_denied') {
            friendlyMessage = '访问被拒绝，请重新注册';
          } else if (error.includes('expired') || errorDescription?.includes('expired')) {
            friendlyMessage = '验证链接已过期，请重新注册';
          } else if (errorDescription) {
            friendlyMessage = decodeURIComponent(errorDescription);
          }
          
          setMessage(friendlyMessage);
          return;
        }
        
        if (type === 'signup' && accessToken && refreshToken) {
          // 设置会话
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('设置会话失败:', error);
            setStatus('error');
            setMessage('邮箱验证失败，请重试');
          } else if (data.user) {
            console.log('邮箱验证成功:', data.user);
            setStatus('success');
            setMessage('邮箱验证成功！正在跳转...');
            
            // 3秒后跳转到首页
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 3000);
          }
        } else {
          // 处理其他情况
          setStatus('error');
          setMessage('无效的验证链接或参数缺失');
        }
      } catch (error) {
        console.error('处理认证回调时发生错误:', error);
        setStatus('error');
        setMessage('处理验证时发生错误');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader className="w-16 h-16 mx-auto mb-4 text-primary-600 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">验证中...</h2>
            <p className="text-gray-600">正在验证您的邮箱，请稍候</p>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">验证成功！</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">
                🎉 欢迎加入创业星球！您现在可以开始使用所有功能了。
              </p>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">验证失败</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">
                如果问题持续存在，请联系客服或重新注册。
              </p>
            </div>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/register')}
                className="btn btn-primary"
              >
                重新注册
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-outline"
              >
                去登录
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
          <Globe className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          创业星球
        </h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;