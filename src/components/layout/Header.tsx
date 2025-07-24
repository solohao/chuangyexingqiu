import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Search, Briefcase, Bot, Users, Code, Wrench, Menu, X, User, LogOut } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { isAuthenticated, user, logout } = useAuthContext()

  const navItems = [
    { name: '创业项目', path: '/projects', icon: Briefcase },
    { name: '创业Agent', path: '/agent', icon: Bot },
    { name: '创客之家', path: '/maker-community', icon: Users },
    { name: '技能市场', path: '/skills-market', icon: Wrench },
    { name: '开发中心', path: '/dev-center', icon: Code },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('搜索:', searchQuery)
  }

  const handleLogout = async () => {
    await logout()
    // 登出后可以添加额外操作，例如重定向
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="创业星球" className="w-8 h-8" />
          <Link to="/" className="text-xl font-bold text-gray-900">创业星球</Link>
        </div>

        <div className="hidden md:block flex-grow max-w-lg mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索项目、技能或创客..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-gray-600 hover:text-primary-600 font-medium flex items-center px-2 py-2 rounded-lg hover:bg-gray-100 text-sm whitespace-nowrap"
            >
              <item.icon className="w-4 h-4 mr-1" />
              <span>{item.name}</span>
            </Link>
          ))}
          <div className="h-6 w-px bg-gray-200 mx-1"></div>
          
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="btn btn-ghost text-sm px-2 py-1 flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span>{user?.user_metadata?.username || '个人中心'}</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="btn btn-ghost text-sm px-2 py-1 flex items-center text-red-500 hover:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span>退出</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost text-sm px-2 py-1">
                登录
              </Link>
              <Link to="/register" className="btn btn-primary text-sm px-2 py-1">
                注册
              </Link>
            </>
          )}
        </nav>

        <button className="md:hidden btn btn-ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索项目、技能或创客..."
                className="w-full pl-10 pr-4 py-2 rounded-full border bg-gray-100 focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} className="flex items-center px-3 py-2 text-lg text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-200 pt-4 flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="btn btn-secondary flex-1 flex items-center justify-center" onClick={() => setIsMenuOpen(false)}>
                    <User className="w-4 h-4 mr-1" />
                    <span>个人中心</span>
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="btn btn-outline flex-1 flex items-center justify-center text-red-500 border-red-500"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    <span>退出</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-secondary flex-1" onClick={() => setIsMenuOpen(false)}>登录</Link>
                  <Link to="/register" className="btn btn-primary flex-1" onClick={() => setIsMenuOpen(false)}>注册</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
