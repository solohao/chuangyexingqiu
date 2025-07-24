import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Globe } from 'lucide-react'
import useAuth from '../../hooks/useAuth' // 恢复导入

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { login, operationLoading, isAuthenticated, user } = useAuth() // 使用operationLoading状态
  const navigate = useNavigate()
  const location = useLocation()

  // 检查是否有来自注册页面的消息
  useEffect(() => {
    const state = location.state as { message?: string; type?: string } | null;
    if (state?.message) {
      if (state.type === 'success') {
        setSuccessMessage(state.message);
      } else {
        setError(state.message);
      }
      // 清除location state
      window.history.replaceState({}, document.title);
    }
  }, [location])

  // 监听认证状态，如果已经登录则自动跳转
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('检测到用户已登录，自动跳转到首页:', { userId: user.id });
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    try {
      console.log('开始登录流程:', { username });
      
      // 使用用户名登录（转换为临时邮箱格式）
      const tempEmail = `${username}@hackathon.temp`;
      const { user, session, error: authError } = await login({ 
        email: tempEmail, 
        password 
      })
      
      if (authError) {
        console.error('登录失败:', authError);
        setError(authError.message || '登录失败，请检查您的邮箱和密码')
      } else if (user && session) {
        console.log('登录成功，准备跳转:', { userId: user.id, hasSession: !!session });
        // 使用 setTimeout 确保状态更新完成后再跳转
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 100);
      } else {
        console.warn('登录返回空用户或会话');
        setError('登录失败，请重试')
      }
    } catch (err) {
      console.error('登录过程中发生异常:', err)
      setError('登录失败，请检查您的邮箱和密码')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
            <Globe className="w-8 h-8 text-primary-600" />
          </div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          登录您的账户
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          或{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            注册新账户
          </Link>
        </p>
        
        {/* 黑客松提醒 */}
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700 text-center">
            💡 使用注册时的用户名和密码登录即可
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                用户名
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  placeholder="请输入注册时的用户名"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  记住我
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  忘记密码?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={operationLoading}
                className={`w-full btn btn-primary ${operationLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {operationLoading ? '登录中...' : '登录'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或通过以下方式登录</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">使用微信登录</span>
                  <span>微信</span>
                </a>
              </div>

              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">使用微博登录</span>
                  <span>微博</span>
                </a>
              </div>

              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">使用QQ登录</span>
                  <span>QQ</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
