import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import routes from './config/routes';
import { chatSessionService } from './services/chatSessionService';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PublishModal from './components/common/PublishModal';
import './index.css';

function App() {
  const location = useLocation();
  
  // 初始化：将本地会话同步到后端
  useEffect(() => {
    const syncLocalSessions = async () => {
      try {
        console.log('正在同步本地会话到后端...');
        await chatSessionService.syncLocalSessionsToBackend();
        console.log('本地会话同步完成');
      } catch (error) {
        console.error('同步本地会话到后端失败:', error);
      }
    };
    
    syncLocalSessions();
  }, []);

  // 判断是否需要显示Header和Footer
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || 
                     location.pathname === '/register' || 
                     location.pathname.startsWith('/auth/');
  
  // 需要全屏显示的页面（不显示Footer）
  const isFullScreenPage = location.pathname === '/agent';
  
  const shouldShowLayout = !isHomePage && !isAuthPage;
  const shouldShowFooter = shouldShowLayout && !isFullScreenPage;
  
  return (
    <div className={`flex flex-col w-full ${isFullScreenPage ? 'h-screen' : 'min-h-screen'}`}>
      {shouldShowLayout && <Header />}
      <main className={`flex-grow w-full ${shouldShowLayout ? '' : 'overflow-hidden'} ${isFullScreenPage ? 'overflow-hidden' : ''}`}>
        <Routes>
          {routes.map((route: { path: string; element: React.ReactNode }) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </main>
      {shouldShowFooter && <Footer />}
      <PublishModal />
    </div>
  );
}

export default App;
