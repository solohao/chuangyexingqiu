import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PROJECT_TYPE_COLORS } from '../../config/amap.config'
import MapComponent from '../../components/specialized/MapComponent'
import ProjectActions from '../../components/specialized/ProjectActions'
import ProjectComments from '../../components/specialized/ProjectComments'
import ProjectTimeline from '../../components/specialized/ProjectTimeline'
import TeamSkillsRadar from '../../components/specialized/TeamSkillsRadar'

// 模拟项目数据
const mockProjects = [
  {
    id: '1',
    title: '智能家居科技',
    type: 'tech',
    description: '开发智能家居系统，提供便捷的家庭自动化解决方案。我们的产品使用物联网技术，将家中各种设备连接起来，通过手机App或语音助手进行控制。目前已完成产品原型开发，正在寻找技术合作伙伴和天使投资。',
    position: [116.403694, 39.914935], // 北京天安门
    founder: '张三',
    foundedAt: '2023-01-15',
    team: [
      { 
        id: 'member_001',
        name: '张三', 
        role: '创始人/CEO', 
        background: '前小米IoT产品经理，5年智能硬件经验',
        skills: ['产品管理', '项目管理', 'IoT', '团队管理'],
        rating: 4.8
      },
      { 
        id: 'member_002',
        name: '李明', 
        role: 'CTO', 
        background: '前华为软件工程师，精通嵌入式开发',
        skills: ['嵌入式开发', 'C++', 'Python', '系统架构'],
        rating: 4.9
      },
      { 
        id: 'member_003',
        name: '王芳', 
        role: '市场总监', 
        background: '10年家电行业营销经验',
        skills: ['市场营销', '渠道管理', '品牌推广', '用户研究'],
        rating: 4.7
      }
    ],
    maxTeamSize: 8,
    seekingRoles: ['前端工程师', '移动端开发', 'UI设计师', '硬件工程师'],
    funding: {
      stage: '种子轮',
      raised: 100,
      seeking: 500,
      equity: 10
    },
    progress: {
      percentage: 65,
      milestones: [
        { title: '产品原型设计', completed: true, date: '2024-02-01' },
        { title: '核心功能开发', completed: true, date: '2024-03-15' },
        { title: '硬件集成测试', completed: false },
        { title: 'Beta版本发布', completed: false },
        { title: '正式产品上线', completed: false }
      ]
    },
    contact: {
      email: 'contact@smarthome.com',
      phone: '13800138000',
      website: 'https://smarthome.com'
    },
    tags: ['物联网', '智能家居', '硬件创新']
  },
  {
    id: '2',
    title: '环保回收站',
    type: 'environment',
    description: '城市垃圾分类回收系统，提高资源利用率。我们开发了智能垃圾分类回收站和配套App，鼓励用户参与垃圾分类，并通过积分奖励机制提高用户参与度。目前已在北京海淀区部署了10个试点站点，效果良好。',
    position: [116.313794, 39.997743], // 北京海淀区
    founder: '李四',
    foundedAt: '2023-03-22',
    team: [
      { name: '李四', role: '创始人/CEO', background: '环保NGO负责人' },
      { name: '赵云', role: 'COO', background: '前物流公司运营总监' },
      { name: '钱多多', role: 'CFO', background: '注册会计师' }
    ],
    funding: {
      stage: '天使轮',
      raised: '¥300万',
      seeking: '¥1000万',
      equity: '15%'
    },
    contact: {
      email: 'contact@ecorecycle.com',
      phone: '13900139000'
    },
    tags: ['环保', '垃圾分类', '可持续发展']
  },
  {
    id: '3',
    title: '在线教育平台',
    type: 'education',
    description: '提供高质量的在线课程和教育资源。我们的平台专注于K12阶段的STEM教育，通过互动式课程和实时反馈系统，提高学生学习兴趣和效果。目前已有超过5000名注册用户，月活跃用户1200人。',
    position: [116.458962, 39.914041], // 北京朝阳区
    founder: '王五',
    foundedAt: '2023-02-10',
    team: [
      { name: '王五', role: '创始人/CEO', background: '前新东方教师' },
      { name: '刘星', role: '教学总监', background: '教育学博士' },
      { name: '张小花', role: '技术负责人', background: '前腾讯开发工程师' }
    ],
    funding: {
      stage: 'Pre-A轮',
      raised: '¥800万',
      seeking: '¥3000万',
      equity: '20%'
    },
    contact: {
      email: 'contact@edutech.com',
      phone: '13700137000'
    },
    tags: ['在线教育', 'STEM', 'K12']
  },
  {
    id: '4',
    title: '社区医疗服务',
    type: 'health',
    description: '为社区提供便捷的医疗咨询和服务。我们开发了线上问诊平台和社区医疗服务网络，让居民足不出户就能获得专业医疗咨询，并提供上门医疗服务。目前已与20家社区诊所和50位专业医生合作。',
    position: [116.364826, 39.855284], // 北京丰台区
    founder: '赵六',
    foundedAt: '2023-04-05',
    team: [
      { name: '赵六', role: '创始人/CEO', background: '前三甲医院副院长' },
      { name: '孙医生', role: '医疗总监', background: '心内科主任医师' },
      { name: '林工', role: '技术总监', background: '医疗信息系统专家' }
    ],
    funding: {
      stage: '种子轮',
      raised: '¥200万',
      seeking: '¥800万',
      equity: '12%'
    },
    contact: {
      email: 'contact@communityhealth.com',
      phone: '13600136000'
    },
    tags: ['医疗健康', '社区服务', '远程问诊']
  }
]

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  
  // 互动状态
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  
  // 评论数据
  const [comments, setComments] = useState([
    {
      id: '1',
      userId: 'user1',
      userName: '小明',
      userAvatar: '',
      content: '这个想法很不错，我有相关的硬件开发经验，可以聊聊吗？',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 5,
      isLiked: false,
      replies: [
        {
          id: '1-1',
          userId: 'user2',
          userName: '张三',
          userAvatar: '',
          content: '欢迎联系！我们正好需要硬件方面的专家。',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          likes: 2,
          isLiked: false,
          replies: []
        }
      ]
    },
    {
      id: '2',
      userId: 'user3',
      userName: '小红',
      userAvatar: '',
      content: '市场调研做了吗？竞品分析如何？',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      likes: 3,
      isLiked: false,
      replies: []
    }
  ])

  useEffect(() => {
    // 模拟API请求
    const fetchProject = () => {
      setLoading(true)
      setTimeout(() => {
        const foundProject = mockProjects.find(p => p.id === id)
        setProject(foundProject || null)
        setLoading(false)
      }, 500)
    }

    fetchProject()
  }, [id])

  // 处理互动操作
  const handleLike = () => setIsLiked(!isLiked)
  const handleBookmark = () => setIsBookmarked(!isBookmarked)
  const handleFollow = () => setIsFollowing(!isFollowing)
  const handleContact = () => {
    // 打开联系创始人对话框
    console.log('联系创始人')
  }
  const handleApply = () => {
    // 打开申请加入团队表单
    console.log('申请加入团队')
  }
  const handleReport = () => {
    // 打开举报表单
    console.log('举报项目')
  }

  // 处理评论操作
  const handleAddComment = (content: string, parentId?: string) => {
    const newComment = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: '当前用户',
      userAvatar: '',
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: []
    }

    if (parentId) {
      // 添加回复
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...comment.replies, newComment]
          }
        }
        return comment
      }))
    } else {
      // 添加新评论
      setComments(prev => [newComment, ...prev])
    }
  }

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        }
      }
      // 处理回复的点赞
      return {
        ...comment,
        replies: comment.replies.map(reply => {
          if (reply.id === commentId) {
            return {
              ...reply,
              isLiked: !reply.isLiked,
              likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
            }
          }
          return reply
        })
      }
    }))
  }

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-primary-600 font-semibold">加载中...</div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">项目不存在</h2>
          <p className="mb-6">抱歉，您查找的项目不存在或已被删除。</p>
          <Link to="/map" className="btn btn-primary">返回地图</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/map" className="text-primary-600 hover:text-primary-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          返回地图
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 项目主要信息 */}
        <div className="lg:col-span-3">
          {/* 项目基本信息 */}
          <div className="card mb-8">
            <div className="flex items-center mb-4">
              <h1 className="text-3xl font-bold mr-3">{project.title}</h1>
              <span 
                className="px-3 py-1 text-sm rounded-full text-white"
                style={{ backgroundColor: PROJECT_TYPE_COLORS[project.type as keyof typeof PROJECT_TYPE_COLORS] }}
              >
                {getProjectTypeName(project.type)}
              </span>
            </div>
            
            <div className="flex items-center text-gray-600 mb-6">
              <div className="mr-4">
                <span className="font-medium">创始人:</span> {project.founder}
              </div>
              <div>
                <span className="font-medium">成立时间:</span> {project.foundedAt}
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">项目描述</h2>
              <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag: string) => (
                <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>

            {/* 融资信息卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{project.funding.stage}</div>
                <div className="text-sm text-gray-500">融资阶段</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">¥{project.funding.raised}万</div>
                <div className="text-sm text-gray-500">已融资</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">¥{project.funding.seeking}万</div>
                <div className="text-sm text-gray-500">目标融资</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">{project.funding.equity}%</div>
                <div className="text-sm text-gray-500">出让股权</div>
              </div>
            </div>
          </div>

          {/* 项目进度时间线 */}
          <ProjectTimeline progress={project.progress} className="mb-8" />

          {/* 团队技能分析 */}
          <TeamSkillsRadar 
            team={project.team}
            seekingRoles={project.seekingRoles}
            maxTeamSize={project.maxTeamSize}
            className="mb-8"
          />

          {/* 项目地图位置 */}
          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">项目位置</h2>
            <div className="h-80 rounded-lg overflow-hidden">
              <MapComponent 
                projects={[project]}
                center={project.position}
                zoom={15}
              />
            </div>
          </div>

          {/* 项目讨论区 */}
          <ProjectComments
            projectId={project.id}
            comments={comments}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
            onDeleteComment={handleDeleteComment}
          />
        </div>

        {/* 侧边栏 */}
        <div className="lg:col-span-1">
          {/* 项目操作 */}
          <div className="sticky top-4">
            <ProjectActions
              project={project}
              isLiked={isLiked}
              isBookmarked={isBookmarked}
              isFollowing={isFollowing}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onFollow={handleFollow}
              onContact={handleContact}
              onApply={handleApply}
              onReport={handleReport}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// 获取项目类型名称
function getProjectTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    tech: '科技项目',
    social: '社会企业',
    culture: '文化创意',
    finance: '金融科技',
    education: '教育科技',
    health: '健康医疗',
    environment: '环保项目',
    other: '其他类型',
  }
  
  return typeNames[type] || type
}

export default ProjectDetail
