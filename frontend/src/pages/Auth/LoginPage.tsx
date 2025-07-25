import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Globe } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'

const LoginPage: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const { login, operationLoading, isAuthenticated, user, resetPassword } = useAuthContext()
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

  // 监听认证状态，如果已经登录则自动跳转（仅用于页面刷新等场景）
  useEffect(() => {
    if (isAuthenticated && user && !operationLoading) {
      console.log('检测到用户已登录，自动跳转到首页:', { userId: user.id });
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, operationLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    try {
      console.log('开始登录流程:', { emailOrUsername });
      
      const result = await login({ 
        email: emailOrUsername, // 可以是邮箱或用户名
        password 
      })
      
      console.log('登录结果详情:', {
        hasUser: !!result.user,
        hasSession: !!result.session,
        hasError: !!result.error,
        userId: result.user?.id,
        errorMessage: result.error?.message
      });
      
      const { user, session, error: authError } = result;
      
      if (authError) {
        console.error('登录失败:', authError);
        setError(authError.message || '登录失败，请检查您的邮箱/用户名和密码');
      } else if (user && session) {
        console.log('登录成功，跳转到首页');
        navigate('/', { replace: true });
      } else {
        setError('登录失败，请重试')
      }
    } catch (err) {
      console.error('登录过程中发生异常:', err)
      setError('登录失败，请稍后重试')
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!forgotEmail) {
      setError('请输入您的邮箱地址')
      return
    }

    try {
      const { error } = await resetPassword(forgotEmail)
      if (error) {
        setError(error.message || '发送重置邮件失败')
      } else {
        setSuccessMessage(`密码重置邮件已发送到 ${forgotEmail}，请检查您的邮箱`)
        setShowForgotPassword(false)
        setForgotEmail('')
      }
    } catch (err) {
      setError('发送重置邮件失败，请稍后重试')
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
          
          {showForgotPassword ? (
            // 忘记密码表单
            <form className="space-y-6" onSubmit={handleForgotPassword}>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">重置密码</h3>
                <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700">
                  邮箱地址
                </label>
                <div className="mt-1">
                  <input
                    id="forgotEmail"
                    name="forgotEmail"
                    type="email"
                    autoComplete="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="input"
                    placeholder="请输入您的注册邮箱"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  我们将向您的邮箱发送密码重置链接
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="flex-1 btn btn-primary"
                >
                  {operationLoading ? '发送中...' : '发送重置邮件'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setForgotEmail('')
                    setError(null)
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  返回登录
                </button>
              </div>
            </form>
          ) : (
            // 登录表单
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700">
                  邮箱或用户名
                </label>
                <div className="mt-1">
                  <input
                    id="emailOrUsername"
                    name="emailOrUsername"
                    type="text"
                    autoComplete="username"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="input"
                    placeholder="请输入邮箱地址或用户名"
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
                    placeholder="请输入密码"
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
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    忘记密码?
                  </button>
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
          )}

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
