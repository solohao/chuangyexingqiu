import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../../components/specialized/ProjectCard';
import { User, Briefcase, MessageSquare, Target, Settings, MapPin, Award, Plus, X } from 'lucide-react';
import { UserProfile } from '../../types/user.types';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfileService } from '../../services/profile.service';
import ImageWithFallback from '../../components/common/ImageWithFallback';

// 使用与ProjectCard组件匹配的Project接口
interface Project {
  id: string;
  title: string;
  type: string;
  founder: string;
  location: string;
  position: [number, number];
  seeking: string;
  image: string;
  description?: string;
  createdAt?: string;
}

type ProfileTab = 'info' | 'projects' | 'messages' | 'preferences' | 'settings';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const { user: authUser } = useAuthContext(); // 恢复使用
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 初始化用户数据
  const [user, setUser] = useState<UserProfile>({
    id: '',
    username: '',
    full_name: '',
    title: '',
    location: '',
    rating: 0,
    avatar_url: '',
    skills: [],
    email: '',
    bio: '',
    company: '',
    created_at: null,
    education: null,
    experience_years: 0,
    interests: [],
    level: 0,
    phone: null,
    points: 0,
    position: '',
    role: 'user',
    social_links: null,
    status: 'active',
    updated_at: null
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // 获取用户资料
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authUser?.id) return;
      
      setLoading(true);
      try {
        const profile = await ProfileService.getProfile(authUser.id);
        if (error) {
          throw error;
        }
        
        if (profile) {
          setUser(profile);
        } else {
          // 如果没有找到用户资料，使用认证用户的基本信息
          setUser({
            id: authUser.id,
            username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || '',
            full_name: authUser.user_metadata?.full_name || '',
            email: authUser.email || '',
            avatar_url: authUser.user_metadata?.avatar_url || '',
            skills: [],
            title: '',
            location: '',
            rating: 0,
            bio: '',
            company: '',
            created_at: null,
            education: null,
            experience_years: 0,
            interests: [],
            level: 0,
            phone: null,
            points: 0,
            position: '',
            role: 'user',
            social_links: null,
            status: 'active',
            updated_at: null
          });
        }
      } catch (err) {
        console.error('获取用户资料失败:', err);
        setError('获取用户资料失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [authUser]);

  const handleAddSkill = () => {
    if (newSkill && user.skills && !user.skills.includes(newSkill)) {
      setUser(prevUser => ({
        ...prevUser,
        skills: [...(prevUser.skills || []), newSkill],
      }));
      setNewSkill('');
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setUser(prevUser => ({
      ...prevUser,
      skills: prevUser.skills ? prevUser.skills.filter(skill => skill !== skillToRemove) : [],
    }));
  };

  const menuItems = [
    { key: 'info', label: '个人资料', icon: User },
    { key: 'messages', label: '消息中心', icon: MessageSquare },
    { key: 'preferences', label: '匹配设置', icon: Target },
    { key: 'settings', label: '账户设置', icon: Settings },
  ];
  
  // 修改模拟项目数据以匹配新的Project接口
  const mockProjects: Project[] = [
    {
      id: '1',
      title: '智能家居控制APP',
      type: 'tech',
      founder: '张三',
      location: '北京市',
      position: [116.4, 39.9],
      seeking: '前端开发',
      image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: '这是一个智能家居控制平台，旨在通过IoT技术连接各种家电设备。',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      title: '电商平台项目',
      type: 'social',
      founder: '李四',
      location: '上海市',
      position: [121.4, 31.2],
      seeking: '后端+设计',
      image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: '构建一个用户友好的在线电商平台，支持多品类商品销售。',
      createdAt: '2024-03-01',
    },
    {
      id: '3',
      title: '区块链钱包应用',
      type: 'tech',
      founder: '王五',
      location: '深圳市',
      position: [114.0, 22.5],
      seeking: '区块链开发',
      image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: '一个安全、高效的数字货币钱包，支持多种加密货币管理和交易。',
      createdAt: '2023-11-20',
    },
    {
      id: '4',
      title: 'AI写作助手',
      type: 'education',
      founder: '赵六',
      location: '杭州市',
      position: [120.2, 30.3],
      seeking: 'AI工程师',
      image: 'https://images.unsplash.com/photo-1677442135136-760c813a496e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: '利用AI技术辅助内容创作者，提供智能写作、润色和优化建议。',
      createdAt: '2024-02-10',
    },
  ];

  // 使用status属性过滤项目
  const getProjectStatus = (project: Project): string => {
    // 这里可以根据项目的其他属性来确定状态
    if (project.id === '1') return '进行中';
    if (project.id === '2') return '招募中';
    if (project.id === '3') return '已完成';
    if (project.id === '4') return '已暂停';
    return '进行中';
  };

  const projectsInProgress = mockProjects.filter(p => getProjectStatus(p) === '进行中');
  const projectsCompleted = mockProjects.filter(p => getProjectStatus(p) === '已完成');
  const projectsPaused = mockProjects.filter(p => getProjectStatus(p) === '已暂停');

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  const skillTagVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 500, damping: 30 } },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
  };

  // 加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-primary-600 text-xl font-semibold">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex container mx-auto p-4 gap-8">
      <aside className="w-1/4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key as ProfileTab)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === item.key
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <section className="flex-1">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {activeTab === 'info' && (
              <div className="space-y-8">
                <motion.div variants={cardVariants} initial="hidden" animate="visible">
                  <div className="p-6 bg-white rounded-lg shadow-card border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">个人资料</h2>
                    <div className="flex items-center space-x-6">
                      <ImageWithFallback
                        src={user.avatar_url || 'https://i.pravatar.cc/150?u=default'}
                        alt={user.full_name || user.username}
                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                      />
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold text-gray-900">{user.full_name || user.username}</h3>
                        <p className="text-md text-gray-600 flex items-center mt-1">
                          <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                          {user.title || '未设置职位'}
                        </p>
                        <p className="text-md text-gray-600 flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {user.location || '未设置地点'}
                        </p>
                        <p className="text-md text-gray-600 flex items-center mt-1">
                          <Award className="w-4 h-4 mr-2 text-gray-400" />
                          信用评分: {user.rating || 0}/5.0
                        </p>
                      </div>
                      <div className="self-start space-x-2">
                        <Link to="/profile/edit" className="btn btn-outline">编辑资料</Link>
                        <Link to={`/user/${user.id}`} className="btn btn-secondary">公开资料</Link>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={1} transition={{ delay: 0.1 }}>
                  <div className="p-6 bg-white rounded-lg shadow-card border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">技能标签</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <AnimatePresence>
                        {user.skills && user.skills.map(skill => (
                          <motion.div
                            key={skill}
                            variants={skillTagVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                          >
                            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">
                              <span>{skill}</span>
                              <button onClick={() => handleRemoveSkill(skill)} className="ml-2 text-gray-400 hover:text-red-500">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {isAddingSkill ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            className="input input-sm"
                            placeholder="输入技能"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                          />
                          <button onClick={handleAddSkill} className="btn btn-primary btn-sm">添加</button>
                          <button onClick={() => setIsAddingSkill(false)} className="btn btn-ghost btn-sm">取消</button>
                        </div>
                      ) : (
                        <button onClick={() => setIsAddingSkill(true)} className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                          <Plus className="w-4 h-4 mr-1" />
                          添加技能
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
            {activeTab === 'projects' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <h2 className="text-xl font-semibold mb-4">我的项目</h2>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700">进行中 ({projectsInProgress.length})</h3>
                  {projectsInProgress.length > 0 ? (
                    projectsInProgress.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))
                  ) : (
                    <p className="text-gray-500">暂无进行中的项目。</p>
                  )}

                  <h3 className="font-semibold text-gray-700">已完成 ({projectsCompleted.length})</h3>
                  {projectsCompleted.length > 0 ? (
                    projectsCompleted.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))
                  ) : (
                    <p className="text-gray-500">暂无已完成的项目。</p>
                  )}

                  <h3 className="font-semibold text-gray-700">已暂停 ({projectsPaused.length})</h3>
                  {projectsPaused.length > 0 ? (
                    projectsPaused.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))
                  ) : (
                    <p className="text-gray-500">暂无已暂停的项目。</p>
                  )}

                  <Link to="/projects/create" className="btn btn-primary mt-4">+ 创建新项目</Link>
                </div>
              </motion.div>
            )}
            {activeTab === 'messages' && <motion.div key="messages-content">消息中心内容（待实现）</motion.div>}
            {activeTab === 'preferences' && <motion.div key="preferences-content">匹配设置内容（待实现）</motion.div>}
            {activeTab === 'settings' && <motion.div key="settings-content">账户设置内容（待实现）</motion.div>}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
};

export default ProfilePage;
