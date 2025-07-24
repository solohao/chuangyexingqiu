# 核心组件设计

## 组件架构原则

### 1. 组件分层
- **页面组件**: 路由级别的容器组件
- **功能组件**: 业务逻辑组件
- **UI组件**: 纯展示组件
- **布局组件**: 页面结构组件

### 2. 设计原则
- **单一职责**: 每个组件只负责一个功能
- **可复用**: 通用组件要高度可配置
- **可维护**: 清晰的接口和文档
- **性能优化**: 合理使用 memo、lazy 等优化

## 关键组件示例

### 1. 项目卡片组件 (ProjectCard)

```typescript
// components/project/ProjectCard.tsx
import React from 'react'
import { Heart, MapPin, Users, Calendar } from 'lucide-react'
import { Card } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Avatar } from '@/components/ui'
import { Button } from '@/components/ui'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  variant?: 'default' | 'compact' | 'featured'
  showActions?: boolean
  onLike?: (projectId: string) => void
  onJoin?: (projectId: string) => void
  onClick?: (project: Project) => void
  className?: string
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  variant = 'default',
  showActions = true,
  onLike,
  onJoin,
  onClick,
  className = ''
}) => {
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    onLike?.(project.id)
  }

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation()
    onJoin?.(project.id)
  }

  const handleClick = () => {
    onClick?.(project)
  }

  const cardClasses = {
    default: 'w-full',
    compact: 'w-full max-w-sm',
    featured: 'w-full border-2 border-blue-200 shadow-lg'
  }

  return (
    <Card 
      className={`${cardClasses[variant]} ${className} cursor-pointer hover:shadow-md transition-shadow`}
      onClick={handleClick}
    >
      {/* 项目图片 */}
      {project.images.length > 0 && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img 
            src={project.images[0]} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
          {project.featured && (
            <Badge 
              variant="featured" 
              className="absolute top-2 right-2"
            >
              精选
            </Badge>
          )}
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* 项目标题和状态 */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {project.title}
          </h3>
          <Badge variant={project.stage}>
            {project.stage}
          </Badge>
        </div>

        {/* 项目描述 */}
        <p className="text-gray-600 line-clamp-3 text-sm">
          {project.description}
        </p>

        {/* 项目信息 */}
        <div className="space-y-2">
          {/* 位置信息 */}
          {project.location && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{project.location.city}</span>
              {project.is_remote && (
                <Badge variant="outline" className="ml-2">
                  远程
                </Badge>
              )}
            </div>
          )}

          {/* 团队信息 */}
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1" />
            <span>
              {project.team_size_current}
              {project.team_size_target && `/${project.team_size_target}`} 人
            </span>
          </div>

          {/* 技能标签 */}
          <div className="flex flex-wrap gap-1">
            {project.skills_needed.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" size="sm">
                {skill}
              </Badge>
            ))}
            {project.skills_needed.length > 3 && (
              <Badge variant="outline" size="sm">
                +{project.skills_needed.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* 创建者信息 */}
        {project.user && (
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Avatar 
              src={project.user.avatar_url} 
              alt={project.user.full_name || project.user.username}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {project.user.full_name || project.user.username}
              </p>
              <p className="text-xs text-gray-500">
                {project.user.position || '创业者'}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              <Calendar className="w-3 h-3 inline mr-1" />
              {new Date(project.created_at).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        {showActions && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <button 
                onClick={handleLike}
                className="flex items-center space-x-1 hover:text-red-500 transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>{project.like_count}</span>
              </button>
              <span>浏览 {project.view_count}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleJoin}
            >
              加入项目
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

export default ProjectCard
```

### 2. 社区内容卡片组件 (CommunityItemCard)

```typescript
// components/community/ItemCard.tsx
import React from 'react'
import { ChevronUp, ChevronDown, MessageCircle, Share2, Eye } from 'lucide-react'
import { Card, Badge, Avatar, Button } from '@/components/ui'
import { VoteButton } from './VoteButton'
import type { CommunityItem } from '@/types'

interface ItemCardProps {
  item: CommunityItem
  showVotes?: boolean
  showComments?: boolean
  onVote?: (itemId: string, type: 'upvote' | 'downvote') => void
  onComment?: (itemId: string) => void
  onShare?: (itemId: string) => void
  onClick?: (item: CommunityItem) => void
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  showVotes = true,
  showComments = true,
  onVote,
  onComment,
  onShare,
  onClick
}) => {
  const typeColors = {
    idea: 'bg-blue-100 text-blue-800',
    feature: 'bg-green-100 text-green-800',
    experience: 'bg-purple-100 text-purple-800',
    question: 'bg-yellow-100 text-yellow-800'
  }

  const typeLabels = {
    idea: '想法',
    feature: '功能建议',
    experience: '经验分享',
    question: '问题咨询'
  }

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <div className="flex">
        {/* 投票区域 */}
        {showVotes && (
          <div className="flex flex-col items-center p-4 space-y-2 border-r">
            <VoteButton
              type="upvote"
              count={item.upvote_count}
              isActive={item.user_vote?.vote_type === 'upvote'}
              onClick={() => onVote?.(item.id, 'upvote')}
            />
            
            <span className="text-lg font-semibold text-gray-700">
              {item.vote_count}
            </span>
            
            <VoteButton
              type="downvote"
              count={item.downvote_count}
              isActive={item.user_vote?.vote_type === 'downvote'}
              onClick={() => onVote?.(item.id, 'downvote')}
            />
          </div>
        )}

        {/* 内容区域 */}
        <div className="flex-1 p-4">
          {/* 标题和类型 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={typeColors[item.type]}>
                  {typeLabels[item.type]}
                </Badge>
                {item.category && (
                  <Badge variant="outline">{item.category}</Badge>
                )}
                {item.featured && (
                  <Badge variant="featured">精选</Badge>
                )}
              </div>
              
              <h3 
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2"
                onClick={() => onClick?.(item)}
              >
                {item.title}
              </h3>
            </div>
            
            {/* 优先级分数 */}
            {item.type === 'feature' && item.priority > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-500">优先级</div>
                <div className="text-lg font-bold text-orange-600">
                  {item.priority}
                </div>
              </div>
            )}
          </div>

          {/* 内容预览 */}
          <div className="mb-4">
            {item.summary ? (
              <p className="text-gray-600 line-clamp-3">{item.summary}</p>
            ) : (
              <p className="text-gray-600 line-clamp-3">{item.content}</p>
            )}
          </div>

          {/* 难度和工作量 */}
          {item.type === 'feature' && (
            <div className="flex space-x-4 mb-4">
              {item.difficulty && (
                <div className="flex items-center space-x-1 text-sm">
                  <span className="text-gray-500">难度:</span>
                  <Badge 
                    variant={
                      item.difficulty === 'easy' ? 'success' :
                      item.difficulty === 'medium' ? 'warning' : 'danger'
                    }
                  >
                    {item.difficulty === 'easy' ? '简单' :
                     item.difficulty === 'medium' ? '中等' : '困难'}
                  </Badge>
                </div>
              )}
              
              {item.estimated_effort && (
                <div className="flex items-center space-x-1 text-sm">
                  <span className="text-gray-500">工作量:</span>
                  <Badge variant="outline">
                    {item.estimated_effort === 'small' ? '小' :
                     item.estimated_effort === 'medium' ? '中' : '大'}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* 标签 */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary" size="sm">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* 作者和时间 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {item.user && (
                <>
                  <Avatar 
                    src={item.user.avatar_url}
                    alt={item.user.full_name || item.user.username}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.user.full_name || item.user.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* 统计信息 */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{item.view_count}</span>
              </div>
              
              {showComments && (
                <button 
                  onClick={() => onComment?.(item.id)}
                  className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{item.comment_count}</span>
                </button>
              )}
              
              <button 
                onClick={() => onShare?.(item.id)}
                className="flex items-center space-x-1 hover:text-green-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>{item.share_count}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ItemCard
```

### 3. 投票按钮组件 (VoteButton)

```typescript
// components/community/VoteButton.tsx
import React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui'

interface VoteButtonProps {
  type: 'upvote' | 'downvote'
  count?: number
  isActive?: boolean
  onClick?: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const VoteButton: React.FC<VoteButtonProps> = ({
  type,
  count,
  isActive = false,
  onClick,
  disabled = false,
  size = 'md'
}) => {
  const Icon = type === 'upvote' ? ChevronUp : ChevronDown
  
  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const activeColor = type === 'upvote' ? 'text-green-600' : 'text-red-600'
  const hoverColor = type === 'upvote' ? 'hover:text-green-600' : 'hover:text-red-600'

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`
        ${sizeClasses[size]} 
        ${isActive ? activeColor : 'text-gray-400'} 
        ${!disabled && !isActive ? hoverColor : ''}
        flex flex-col items-center p-1 min-w-0
      `}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className={iconSizes[size]} />
      {count !== undefined && (
        <span className="text-xs">{count}</span>
      )}
    </Button>
  )
}

export default VoteButton
```

### 4. 地图容器组件 (AMapContainer)

```typescript
// components/map/AMapContainer.tsx
import React, { useEffect, useRef, useState } from 'react'
import { useMap } from '@/hooks/useMap'
import type { GeoLocation, MapMarker } from '@/types'

interface AMapContainerProps {
  center?: GeoLocation
  zoom?: number
  markers?: MapMarker[]
  showCurrentLocation?: boolean
  onMarkerClick?: (marker: MapMarker) => void
  onMapClick?: (location: GeoLocation) => void
  onLocationChange?: (location: GeoLocation) => void
  className?: string
  height?: string
}

export const AMapContainer: React.FC<AMapContainerProps> = ({
  center = { lat: 39.908823, lng: 116.397470 }, // 默认北京
  zoom = 10,
  markers = [],
  showCurrentLocation = false,
  onMarkerClick,
  onMapClick,
  onLocationChange,
  className = '',
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const { 
    isLoaded, 
    currentLocation, 
    getCurrentLocation,
    createMarker,
    removeMarker 
  } = useMap()

  // 初始化地图
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstance) return

    const map = new (window as any).AMap.Map(mapRef.current, {
      center: [center.lng, center.lat],
      zoom: zoom,
      mapStyle: 'amap://styles/normal',
      viewMode: '3D',
      pitch: 0
    })

    // 地图点击事件
    if (onMapClick) {
      map.on('click', (e: any) => {
        const location = {
          lat: e.lnglat.lat,
          lng: e.lnglat.lng
        }
        onMapClick(location)
      })
    }

    // 地图移动事件
    if (onLocationChange) {
      map.on('moveend', () => {
        const center = map.getCenter()
        const location = {
          lat: center.lat,
          lng: center.lng
        }
        onLocationChange(location)
      })
    }

    setMapInstance(map)

    return () => {
      map.destroy()
    }
  }, [isLoaded, center, zoom, onMapClick, onLocationChange])

  // 添加标记点
  useEffect(() => {
    if (!mapInstance || !markers.length) return

    const markerInstances = markers.map(marker => {
      const markerObj = createMarker({
        position: [marker.position.lng, marker.position.lat],
        title: marker.title,
        content: marker.content
      })

      if (onMarkerClick) {
        markerObj.on('click', () => {
          onMarkerClick(marker)
        })
      }

      return markerObj
    })

    return () => {
      markerInstances.forEach(marker => {
        removeMarker(marker)
      })
    }
  }, [mapInstance, markers, onMarkerClick])

  // 显示当前位置
  useEffect(() => {
    if (!showCurrentLocation || !mapInstance) return

    getCurrentLocation().then(location => {
      if (location) {
        const marker = createMarker({
          position: [location.lng, location.lat],
          title: '当前位置',
          icon: new (window as any).AMap.Icon({
            size: new (window as any).AMap.Size(25, 34),
            image: '/icons/current-location.png',
            imageSize: new (window as any).AMap.Size(25, 34)
          })
        })
        
        mapInstance.setCenter([location.lng, location.lat])
      }
    })
  }, [showCurrentLocation, mapInstance, getCurrentLocation])

  if (!isLoaded) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ height }}
      >
        <div className="text-gray-500">加载地图中...</div>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      className={`w-full ${className}`}
      style={{ height }}
    />
  )
}

export default AMapContainer
```

### 5. 聊天窗口组件 (ChatWindow)

```typescript
// components/chat/ChatWindow.tsx
import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'
import { Button, Avatar, ScrollArea } from '@/components/ui'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { useChat } from '@/hooks/useChat'
import type { ChatChannel, SendMessageRequest } from '@/types'

interface ChatWindowProps {
  channel: ChatChannel
  className?: string
  height?: string
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  channel,
  className = '',
  height = '500px'
}) => {
  const { 
    messages, 
    sendMessage, 
    markAsRead,
    subscribeToMessages,
    loading 
  } = useChat(channel.id)
  
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 订阅消息更新
  useEffect(() => {
    const unsubscribe = subscribeToMessages(channel.id)
    return unsubscribe
  }, [channel.id, subscribeToMessages])

  // 标记为已读
  useEffect(() => {
    markAsRead(channel.id)
  }, [channel.id, markAsRead])

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (data: Omit<SendMessageRequest, 'channel_id'>) => {
    if (!data.content?.trim() && !data.attachments?.length) return

    try {
      await sendMessage({
        channel_id: channel.id,
        ...data
      })
      setInputValue('')
    } catch (error) {
      console.error('发送消息失败:', error)
    }
  }

  const getChannelTitle = () => {
    if (channel.name) return channel.name
    
    if (channel.type === 'direct' && channel.participants) {
      // 直接对话显示对方用户名
      const otherUser = channel.participants.find(p => p.user_id !== 'current_user_id')
      return otherUser?.user?.full_name || otherUser?.user?.username || '用户'
    }
    
    return '聊天'
  }

  return (
    <div className={`flex flex-col bg-white border rounded-lg ${className}`} style={{ height }}>
      {/* 聊天头部 */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          {channel.avatar_url ? (
            <Avatar src={channel.avatar_url} alt={getChannelTitle()} />
          ) : (
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {getChannelTitle().charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{getChannelTitle()}</h3>
            {channel.description && (
              <p className="text-sm text-gray-500">{channel.description}</p>
            )}
          </div>
        </div>
        
        {/* 在线状态或参与者数量 */}
        {channel.participants && (
          <div className="text-sm text-gray-500">
            {channel.participants.length} 人
          </div>
        )}
      </div>

      {/* 消息列表 */}
      <ScrollArea className="flex-1 p-4">
        <MessageList 
          messages={messages} 
          loading={loading}
          onMessageReply={(messageId) => {
            // 处理回复逻辑
          }}
        />
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* 输入区域 */}
      <div className="border-t p-4">
        <MessageInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          placeholder="输入消息..."
          disabled={loading}
        />
      </div>
    </div>
  )
}

export default ChatWindow
```

## 组件使用最佳实践

### 1. 性能优化

```typescript
// 使用 React.memo 优化重渲染
export const ProjectCard = React.memo<ProjectCardProps>(({ project, ...props }) => {
  // 组件实现
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return prevProps.project.id === nextProps.project.id &&
         prevProps.project.updated_at === nextProps.project.updated_at
})

// 使用 useMemo 优化计算
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(props.data)
}, [props.data])

// 使用 useCallback 优化函数
const handleClick = useCallback((id: string) => {
  onAction(id)
}, [onAction])
```

### 2. 错误边界

```typescript
// components/common/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback
      return <Fallback error={this.state.error} />
    }

    return this.props.children
  }
}
```

### 3. 加载状态

```typescript
// hooks/useAsyncComponent.ts
export const useAsyncComponent = <T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
) => {
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: Error | null
  }>({
    data: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    let mounted = true
    
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    asyncFn()
      .then(data => {
        if (mounted) {
          setState({ data, loading: false, error: null })
        }
      })
      .catch(error => {
        if (mounted) {
          setState({ data: null, loading: false, error })
        }
      })

    return () => {
      mounted = false
    }
  }, deps)

  return state
}
```

### 4. 条件渲染模式

```typescript
// 条件渲染组件
const ConditionalRender: React.FC<{
  condition: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}> = ({ condition, children, fallback = null }) => {
  return condition ? <>{children}</> : <>{fallback}</>
}

// 使用示例
<ConditionalRender 
  condition={user.isLoggedIn} 
  fallback={<LoginPrompt />}
>
  <UserDashboard />
</ConditionalRender>
``` 