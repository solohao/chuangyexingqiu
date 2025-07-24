import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Globe } from 'lucide-react'
import useAuth from '../../hooks/useAuth' // 恢复导入

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  })
  const [error, setError] = useState<string | null>(null)
  const { register, operationLoading } = useAuth() // 使用operationLoading
  const navigate = useNavigate()

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

    // 简单的表单验证
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (!formData.agreeTerms) {
      setError('请同意用户协议和隐私政策')
      return
    }

    try {
      console.log('提交简化注册表单:', { 
        username: formData.username,
        passwordLength: formData.password.length 
      });
      
      // 简化注册逻辑
      const { user, session, error: authError } = await register({
        username: formData.username,
        password: formData.password
      })
      
      if (authError) {
        console.error('注册错误详情:', authError);
        let errorMessage = authError.message || '注册失败，请稍后再试';
        
        // 针对常见错误提供更友好的提示
        if (errorMessage.includes('User already registered')) {
          errorMessage = '用户名已被注册，请选择其他用户名';
        } else if (errorMessage.includes('password')) {
          errorMessage = '密码不符合要求，请确保密码长度至少为6位';
        }
        
        setError(errorMessage);
      } else if (user && session) {
        // 注册成功且已自动登录，直接跳转首页
        console.log('注册并登录成功，跳转首页');
        navigate('/', { replace: true });
      } else {
        // 注册成功但未登录，跳转登录页
        navigate('/login', { 
          state: { 
            message: '注册成功！请使用用户名和密码登录。',
            type: 'success'
          } 
        });
      }
    } catch (err) {
      console.error('注册过程中发生异常:', err)
      setError('注册失败，请稍后再试')
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
        
        {/* 黑客松提醒 */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700 text-center">
            🚀 黑客松快速体验模式：无需邮件验证，注册即可使用！
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <form className="space-y-3" onSubmit={handleSubmit}>
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
                  value={formData.username}
                  onChange={handleChange}
                  className="input"
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">密码长度至少为8位，包含字母和数字</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                确认密码
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
                <a href="#" className="text-primary-600 hover:text-primary-500">用户协议</a>
                和
                <a href="#" className="text-primary-600 hover:text-primary-500">隐私政策</a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={operationLoading}
                className={`w-full btn btn-primary ${operationLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {operationLoading ? '注册中...' : '注册'}
              </button>
            </div>
          </form>

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
