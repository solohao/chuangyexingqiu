import { Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy } from 'react'

// 布局组件
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import PublishModal from './components/common/PublishModal';

// 认证组件
import ProtectedRoute from './components/auth/ProtectedRoute'; // 恢复导入

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/Home/HomePage'))
const ProjectDetail = lazy(() => import('./pages/Projects/ProjectDetail'))
const ProjectsPage = lazy(() => import('./pages/Projects/ProjectsPage'))
const AgentPage = lazy(() => import('./pages/Agent/AgentPage'))
const MakerCommunityPage = lazy(() => import('./pages/MakerCommunity/MakerCommunityPage'))
const SkillsMarketPage = lazy(() => import('./pages/SkillsMarket/SkillsMarketPage'))
const DevCenterPage = lazy(() => import('./pages/DevCenter/DevCenterPage'))
const CommunityLayout = lazy(() => import('./pages/Community/CommunityLayout'))
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'))
const AuthCallbackPage = lazy(() => import('./pages/Auth/AuthCallbackPage'))
const ProfilePage = lazy(() => import('./pages/Auth/ProfilePage'))
const EditProfilePage = lazy(() => import('./pages/Auth/EditProfilePage.tsx'))

// 加载状态组件
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-primary-600 text-xl font-semibold">加载中...</div>
  </div>
)

function AppLayout() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="flex flex-col min-h-screen">
      {!isHomePage && !isAuthPage && <Header />}
      <main className="flex-grow">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* 公共路由 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            
            {/* 新增的主导航路由 */}
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/agent" element={<AgentPage />} />
            <Route path="/maker-community" element={<MakerCommunityPage />} />
            <Route path="/skills-market" element={<SkillsMarketPage />} />
            <Route path="/dev-center" element={<DevCenterPage />} />
            
            {/* 受保护的路由 - 恢复保护 */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/community/*" element={
              <ProtectedRoute>
                <CommunityLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </main>
      {!isHomePage && !isAuthPage && <Footer />}
      <PublishModal />
    </div>
  )
}

export default AppLayout
