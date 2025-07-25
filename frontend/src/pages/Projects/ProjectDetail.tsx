import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { PROJECT_TYPE_COLORS } from '../../config/amap.config'
import { ProjectService } from '../../services/project.service'
import MapComponent from '../../components/specialized/MapComponent'
import ProjectActions from '../../components/specialized/ProjectActions'
import ProjectComments from '../../components/specialized/ProjectComments'

// 项目类型名称映射
const getProjectTypeName = (type: string) => {
  const typeNames: { [key: string]: string } = {
    'startup': '创业项目',
    'tech': '技术项目',
    'social': '社会公益',
    'culture': '文化创意',
    'education': '教育培训',
    'health': '医疗健康',
    'environment': '环保绿色',
    'other': '其他'
  };
  return typeNames[type] || type;
};

// 项目详情页面组件

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
    // 从数据库获取项目数据
    const fetchProject = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { project: fetchedProject, error } = await ProjectService.getProject(id);
        
        if (error) {
          console.error('获取项目详情失败:', error);
          setProject(null);
        } else {
          setProject(fetchedProject);
        }
      } catch (error) {
        console.error('获取项目详情异常:', error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
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
          <Link to="/projects" className="btn btn-primary">返回项目列表</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/projects" className="text-primary-600 hover:text-primary-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          返回项目列表
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
                <span className="font-medium">创始人:</span> {project.founder_name || project.founder}
              </div>
              <div>
                <span className="font-medium">成立时间:</span> {new Date(project.created_at || project.foundedAt).toLocaleDateString()}
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">项目描述</h2>
              <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {(project.tags || []).map((tag: string) => (
                <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>

            {/* 融资信息卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{project.funding_stage || '未设置'}</div>
                <div className="text-sm text-gray-500">融资阶段</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">¥{project.funding_raised || 0}万</div>
                <div className="text-sm text-gray-500">已融资</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">¥{project.funding_target || 0}万</div>
                <div className="text-sm text-gray-500">目标融资</div>
              </div>
            </div>

            {/* 联系信息 */}
            {(project.contact_email || project.contact_phone || project.website_url || project.demo_url) && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-3">联系方式</h3>
                <div className="space-y-2 text-sm">
                  {project.contact_email && (
                    <div>
                      <span className="font-medium">邮箱：</span>
                      <a href={`mailto:${project.contact_email}`} className="text-blue-600 hover:underline">
                        {project.contact_email}
                      </a>
                    </div>
                  )}
                  {project.contact_phone && (
                    <div>
                      <span className="font-medium">电话：</span>
                      <a href={`tel:${project.contact_phone}`} className="text-blue-600 hover:underline">
                        {project.contact_phone}
                      </a>
                    </div>
                  )}
                  {project.website_url && (
                    <div>
                      <span className="font-medium">官网：</span>
                      <a href={project.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {project.website_url}
                      </a>
                    </div>
                  )}
                  {project.demo_url && (
                    <div>
                      <span className="font-medium">演示：</span>
                      <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {project.demo_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 项目进度信息 */}
          {project.progress_percentage !== undefined && (
            <div className="card mb-8">
              <h2 className="text-xl font-semibold mb-4">项目进度</h2>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full" 
                  style={{ width: `${project.progress_percentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{project.progress_percentage}% 完成</p>
            </div>
          )}

          {/* 团队信息 */}
          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">团队信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">当前团队规模:</span> {project.team_size || 1}人
              </div>
              <div>
                <span className="font-medium">最大团队规模:</span> {project.max_team_size || 10}人
              </div>
            </div>
            
            {project.seeking_roles && project.seeking_roles.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">招募角色:</h3>
                <div className="flex flex-wrap gap-2">
                  {project.seeking_roles.map((role: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.skills && project.skills.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">所需技能:</h3>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill: string, index: number) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 项目位置信息 */}
          {(project.location || project.city || project.province) && (
            <div className="card mb-8">
              <h2 className="text-xl font-semibold mb-4">项目位置</h2>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>
                  {[project.location, project.city, project.province].filter(Boolean).join(', ')}
                </span>
              </div>
              {project.latitude && project.longitude && (
                <div className="h-80 rounded-lg overflow-hidden mt-4">
                  <MapComponent 
                    projects={[{
                      ...project,
                      position: [project.longitude, project.latitude]
                    }]}
                    center={[project.longitude, project.latitude]}
                    zoom={15}
                  />
                </div>
              )}
            </div>
          )}

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



export default ProjectDetail
