import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// 懒加载页面组件
const HomePage = lazy(() => import('../pages/Home/HomePage'));
const ProjectDetail = lazy(() => import('../pages/Projects/ProjectDetail'));
const ProjectsPage = lazy(() => import('../pages/Projects/ProjectsPage'));
const CreateProject = lazy(() => import('../pages/Projects/CreateProject'));
const AgentPage = lazy(() => import('../pages/Agent/AgentPage'));
const MakerCommunityPage = lazy(() => import('../pages/MakerCommunity/MakerCommunityPage'));
const SkillsMarketPage = lazy(() => import('../pages/SkillsMarket/SkillsMarketPage'));
const DevCenterPage = lazy(() => import('../pages/DevCenter/DevCenterPage'));
const CommunityLayout = lazy(() => import('../pages/Community/CommunityLayout'));
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/Auth/RegisterPage'));
const AuthCallback = lazy(() => import('../pages/Auth/AuthCallback'));
const ResetPasswordPage = lazy(() => import('../pages/Auth/ResetPasswordPage'));
const ProfilePage = lazy(() => import('../pages/Auth/ProfilePage'));
const EditProfilePage = lazy(() => import('../pages/Auth/EditProfilePage'));

// 加载状态组件
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-primary-600 text-xl font-semibold">加载中...</div>
  </div>
);

// 路由配置
const routes = [
  // 公共路由
  {
    path: '/',
    element: <Suspense fallback={<LoadingFallback />}><HomePage /></Suspense>
  },
  {
    path: '/login',
    element: <Suspense fallback={<LoadingFallback />}><LoginPage /></Suspense>
  },
  {
    path: '/register',
    element: <Suspense fallback={<LoadingFallback />}><RegisterPage /></Suspense>
  },
  {
    path: '/auth/callback',
    element: <Suspense fallback={<LoadingFallback />}><AuthCallback /></Suspense>
  },
  {
    path: '/auth/reset-password',
    element: <Suspense fallback={<LoadingFallback />}><ResetPasswordPage /></Suspense>
  },
  
  // 新增的主导航路由
  {
    path: '/projects',
    element: <Suspense fallback={<LoadingFallback />}><ProjectsPage /></Suspense>
  },
  {
    path: '/projects/create',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <CreateProject />
        </ProtectedRoute>
      </Suspense>
    )
  },
  {
    path: '/project/:id',
    element: <Suspense fallback={<LoadingFallback />}><ProjectDetail /></Suspense>
  },
  {
    path: '/agent',
    element: <Suspense fallback={<LoadingFallback />}><AgentPage /></Suspense>
  },
  {
    path: '/maker-community',
    element: <Suspense fallback={<LoadingFallback />}><MakerCommunityPage /></Suspense>
  },
  {
    path: '/skills-market',
    element: <Suspense fallback={<LoadingFallback />}><SkillsMarketPage /></Suspense>
  },
  {
    path: '/dev-center',
    element: <Suspense fallback={<LoadingFallback />}><DevCenterPage /></Suspense>
  },
  
  // 受保护的路由
  {
    path: '/profile',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </Suspense>
    )
  },
  {
    path: '/profile/edit',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <EditProfilePage />
        </ProtectedRoute>
      </Suspense>
    )
  },
  {
    path: '/community/*',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <CommunityLayout />
        </ProtectedRoute>
      </Suspense>
    )
  }
];

export default routes;
