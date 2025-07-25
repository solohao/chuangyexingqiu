import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Globe, Mail, CheckCircle } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    agreeTerms: false
  })
  const [error, setError] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const { register, operationLoading, isAuthenticated, user, resendVerificationEmail } = useAuthContext()
  const navigate = useNavigate()

  // 监听认证状态，如果已经登录则自动跳转（仅用于页面刷新等场景）
  useEffect(() => {
    if (isAuthenticated && user && !operationLoading) {
      console.log('检测到用户已登录，自动跳转到首页:', { userId: user.id });
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, operationLoading, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 表单验证
    if (!formData.email) {
      setError('请输入邮箱地址')
      return
    }

    if (!formData.email.includes('@')) {
      setError('请输入有效的邮箱地址')
      return
    }

    if (!formData.username) {
      setError('请输入用户名')
      return
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为6位')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (!formData.agreeTerms) {
      setError('请同意用户协议和隐私政策')
      return
    }

    try {
      console.log('提交完整注册表单:', { 
        email: formData.email,
        username: formData.username,
        passwordLength: formData.password.length 
      });
      
      const result = await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name || formData.username
      })
      
      console.log('注册结果详情:', {
        hasUser: !!result.user,
        hasSession: !!result.session,
        hasError: !!result.error,
        needsVerification: result.needsEmailVerification,
        userId: result.user?.id,
        errorMessage: result.error?.message
      });
      
      const { user, session, error: authError, needsEmailVerification } = result;
      
      if (authError) {
        console.error('注册错误详情:', authError);
        setError(authError.message || '注册失败，请稍后再试');
      } else if (needsEmailVerification) {
        // 需要邮箱验证
        setNeedsVerification(true);
        setRegisteredEmail(formData.email);
      } else if (user && session) {
        // 注册成功且已自动登录
        console.log('注册并登录成功，跳转到首页');
        navigate('/', { replace: true });
      } else {
        // 其他情况，跳转登录页
        navigate('/login', { 
          state: { 
            message: '注册成功！请登录您的账户。',
            type: 'success'
          } 
        });
      }
    } catch (err) {
      console.error('注册过程中发生异常:', err)
      setError('注册失败，请稍后再试')
    }
  }

  const handleResendVerification = async () => {
    try {
      const { error } = await resendVerificationEmail(registeredEmail);
      if (error) {
        setError(error.message || '重发验证邮件失败');
      } else {
        setError(null);
        // 可以显示成功消息
      }
    } catch (err) {
      setError('重发验证邮件失败，请稍后重试');
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
          注册新账户
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          已有账户?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            立即登录
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {needsVerification ? (
            // 邮箱验证提示页面
            <div className="text-center">
              <Mail className="mx-auto h-12 w-12 text-primary-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                验证您的邮箱
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                我们已向 <strong>{registeredEmail}</strong> 发送了验证邮件。
                请检查您的邮箱并点击验证链接完成注册。
              </p>
              
              <div className="mt-6 space-y-4">
                <button
                  onClick={handleResendVerification}
                  disabled={operationLoading}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {operationLoading ? '发送中...' : '重新发送验证邮件'}
                </button>
                
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  返回登录
                </Link>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                <p>没有收到邮件？请检查垃圾邮件文件夹</p>
              </div>
            </div>
          ) : (
            // 注册表单
            <>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    邮箱地址 *
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="input"
                      placeholder="请输入您的邮箱地址"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    用户名 *
                  </label>
                  <div className="mt-1">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="input"
                      placeholder="请输入用户名"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">用户名将用于登录和展示</p>
                </div>

                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                    真实姓名
                  </label>
                  <div className="mt-1">
                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      autoComplete="name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="input"
                      placeholder="请输入您的真实姓名（可选）"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    密码 *
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="input"
                      placeholder="请输入密码"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">密码长度至少为6位</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    确认密码 *
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input"
                      placeholder="请再次输入密码"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900">
                    我已阅读并同意
                    <a href="#" className="text-primary-600 hover:text-primary-500 mx-1">用户协议</a>
                    和
                    <a href="#" className="text-primary-600 hover:text-primary-500 ml-1">隐私政策</a>
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={operationLoading}
                    className={`w-full btn btn-primary ${operationLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {operationLoading ? '注册中...' : '注册账户'}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或通过以下方式注册</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span>微信</span>
                </a>
              </div>

              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span>微博</span>
                </a>
              </div>

              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
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

export default RegisterPage
