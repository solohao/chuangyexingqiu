import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, loading, user, initialized } = useAuthContext();
  const location = useLocation();

  // 调试信息
  console.log('ProtectedRoute 状态:', { 
    isAuthenticated, 
    loading, 
    initialized,
    userId: user?.id,
    pathname: location.pathname 
  });

  // 如果正在加载且未初始化，显示加载状态
  if (loading && !initialized) {
    console.log('显示加载状态');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-primary-600 text-xl font-semibold">加载中...</div>
      </div>
    );
  }

  // 如果未认证，重定向到登录页面
  if (!isAuthenticated) {
    console.log('用户未认证，重定向到登录页');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // 如果已认证，显示子组件
  console.log('用户已认证，显示子组件');
  return <>{children}</>;
};

export default ProtectedRoute; 