import React, { useState } from 'react';
import { Users, MessageCircle, Calendar, Award, Hash, ThumbsUp, Eye, Star, MapPin, User, ChevronRight, Search, FileText } from 'lucide-react';

// 创客展示数据
interface Maker {
  id: string;
  name: string;
  avatar: string;
  title: string;
  skills: string[];
  location: string;
  projects: number;
  followers: number;
  bio: string;
}

// 创业讨论数据
interface Discussion {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  replies: number;
  views: number;
  likes: number;
  tags: string[];
  excerpt: string;
}

// 社区活动数据
interface Event {
  id: string;
  title: string;
  type: 'online' | 'offline';
  date: string;
  time: string;
  location: string;
  organizer: string;
  participants: number;
  maxParticipants?: number;
  image: string;
  tags: string[];
}

// 创业成果数据
interface Achievement {
  id: string;
  title: string;
  company: string;
  logo: string;
  milestone: string;
  date: string;
  description: string;
  metrics: {
    label: string;
    value: string;
  }[];
}

// 热门话题数据
interface Topic {
  id: string;
  name: string;
  posts: number;
  followers: number;
  trending: boolean;
  description: string;
}

const MakerCommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('showcase');

  const tabs = [
    { id: 'showcase', name: '创客展示', icon: Users },
    { id: 'discussions', name: '创业讨论', icon: MessageCircle },
    { id: 'events', name: '社区活动', icon: Calendar },
    { id: 'achievements', name: '创业成果', icon: Award },
    { id: 'topics', name: '热门话题', icon: Hash },
  ];

  // 模拟数据 - 创客展示
  const makers: Maker[] = [
    {
      id: '1',
      name: '张三',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      title: '全栈开发者 / 创业者',
      skills: ['React', 'Node.js', '产品设计', '项目管理'],
      location: '北京',
      projects: 5,
      followers: 128,
      bio: '连续创业者，专注于AI+教育领域，曾获2次天使轮融资。热爱技术，乐于分享。'
    },
    {
      id: '2',
      name: '李四',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      title: 'UI/UX设计师',
      skills: ['UI设计', 'Figma', '用户研究', '品牌设计'],
      location: '上海',
      projects: 12,
      followers: 256,
      bio: '拥有8年设计经验，专注于用户体验和交互设计。曾服务过多家知名互联网公司和初创企业。'
    },
    {
      id: '3',
      name: '王五',
      avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
      title: '市场营销专家',
      skills: ['内容营销', 'SEM', '社交媒体', '用户增长'],
      location: '广州',
      projects: 3,
      followers: 89,
      bio: '数字营销专家，擅长低成本获客和品牌建设。曾帮助多个初创项目实现快速增长。'
    },
    {
      id: '4',
      name: '赵六',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      title: '产品经理 / 创业顾问',
      skills: ['产品规划', '商业模式', '用户研究', '数据分析'],
      location: '深圳',
      projects: 7,
      followers: 315,
      bio: '前BAT产品经理，现为多家创业公司提供产品和战略咨询。专注于To B产品和企业服务。'
    },
    {
      id: '5',
      name: '钱七',
      avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
      title: '硬件工程师',
      skills: ['嵌入式系统', 'IoT', '电路设计', '3D打印'],
      location: '杭州',
      projects: 4,
      followers: 76,
      bio: '硬件极客，热爱将创意变为实体产品。曾参与多个智能硬件项目从概念到量产的全过程。'
    },
    {
      id: '6',
      name: '孙八',
      avatar: 'https://randomuser.me/api/portraits/women/54.jpg',
      title: '投资人 / 创业导师',
      skills: ['投资分析', '商业计划', '融资策略', '创业辅导'],
      location: '成都',
      projects: 15,
      followers: 423,
      bio: '天使投资人，关注早期科技创业项目。曾投资20+创业团队，5个项目成功退出。'
    }
  ];

  // 模拟数据 - 创业讨论
  const discussions: Discussion[] = [
    {
      id: '1',
      title: '初创公司如何低成本获客？分享我的经验和踩过的坑',
      author: {
        name: '张三',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      date: '2024-01-20',
      replies: 24,
      views: 342,
      likes: 56,
      tags: ['获客', '营销', '增长'],
      excerpt: '作为一个初创公司，预算有限但又需要快速获取用户，这里分享我过去两年尝试过的一些方法...'
    },
    {
      id: '2',
      title: '技术创始人如何提升商业敏感度？',
      author: {
        name: '李四',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
      },
      date: '2024-01-18',
      replies: 31,
      views: 289,
      likes: 42,
      tags: ['创始人', '商业', '技术'],
      excerpt: '作为一个技术背景的创始人，我发现自己在商业决策上经常陷入困境...'
    },
    {
      id: '3',
      title: '从0到1：我们如何在6个月内完成产品验证',
      author: {
        name: '王五',
        avatar: 'https://randomuser.me/api/portraits/men/62.jpg'
      },
      date: '2024-01-15',
      replies: 18,
      views: 412,
      likes: 87,
      tags: ['产品验证', 'MVP', '用户反馈'],
      excerpt: '去年我们从一个简单的想法开始，通过一系列快速迭代和用户访谈，最终找到了产品市场契合点...'
    },
    {
      id: '4',
      title: '创业公司如何做好远程团队管理？',
      author: {
        name: '赵六',
        avatar: 'https://randomuser.me/api/portraits/women/22.jpg'
      },
      date: '2024-01-12',
      replies: 42,
      views: 531,
      likes: 103,
      tags: ['团队管理', '远程工作', '协作'],
      excerpt: '疫情后我们团队转为全远程办公，这里分享一些我们在团队协作和管理上的经验...'
    },
    {
      id: '5',
      title: '创业失败后，如何东山再起？',
      author: {
        name: '钱七',
        avatar: 'https://randomuser.me/api/portraits/men/11.jpg'
      },
      date: '2024-01-10',
      replies: 56,
      views: 678,
      likes: 124,
      tags: ['失败', '心态', '重新开始'],
      excerpt: '去年我的第一个创业项目以失败告终，这里想分享一下我的心路历程和从中学到的宝贵经验...'
    }
  ];

  // 模拟数据 - 社区活动
  const events: Event[] = [
    {
      id: '1',
      title: '2024创业者春季交流会',
      type: 'offline',
      date: '2024-02-15',
      time: '14:00-17:00',
      location: '北京市海淀区中关村创业大厦',
      organizer: '创业星球社区',
      participants: 45,
      maxParticipants: 100,
      image: 'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      tags: ['交流会', '创业分享', '社交']
    },
    {
      id: '2',
      title: '产品经理训练营：从0到1打造爆款产品',
      type: 'online',
      date: '2024-02-20',
      time: '19:30-21:30',
      location: '线上直播',
      organizer: '产品大咖俱乐部',
      participants: 213,
      image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      tags: ['产品', '培训', '线上']
    },
    {
      id: '3',
      title: '创业融资路演日',
      type: 'offline',
      date: '2024-03-05',
      time: '09:00-17:00',
      location: '上海市浦东新区金融中心',
      organizer: '创投联盟',
      participants: 28,
      maxParticipants: 30,
      image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      tags: ['融资', '路演', '投资']
    },
    {
      id: '4',
      title: '技术创新工作坊：AI应用实战',
      type: 'offline',
      date: '2024-03-12',
      time: '13:30-17:30',
      location: '深圳市南山区科技园',
      organizer: '深圳开发者社区',
      participants: 56,
      maxParticipants: 80,
      image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      tags: ['AI', '技术', '工作坊']
    },
    {
      id: '5',
      title: '创业心理健康线上论坛',
      type: 'online',
      date: '2024-03-18',
      time: '20:00-21:30',
      location: '线上直播',
      organizer: '创业者心理健康联盟',
      participants: 132,
      image: 'https://images.unsplash.com/photo-1573497491765-dccce02b29df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      tags: ['心理健康', '压力管理', '创业者']
    }
  ];

  // 模拟数据 - 创业成果
  const achievements: Achievement[] = [
    {
      id: '1',
      title: '完成A轮融资1000万',
      company: '智能家居科技',
      logo: 'https://via.placeholder.com/80',
      milestone: '融资',
      date: '2024-01-10',
      description: '我们的智能家居解决方案获得了来自多家知名投资机构的认可，成功完成A轮融资。',
      metrics: [
        { label: '融资金额', value: '1000万' },
        { label: '估值', value: '1亿' },
        { label: '投资方', value: '红杉资本、IDG' }
      ]
    },
    {
      id: '2',
      title: '用户突破100万里程碑',
      company: '健康饮食配送',
      logo: 'https://via.placeholder.com/80',
      milestone: '用户增长',
      date: '2024-01-05',
      description: '经过两年的努力，我们的健康饮食配送服务用户数量突破100万，月订单量超过50万。',
      metrics: [
        { label: '用户数', value: '100万+' },
        { label: '月订单', value: '50万+' },
        { label: '复购率', value: '78%' }
      ]
    },
    {
      id: '3',
      title: '成功上线海外市场',
      company: '在线教育平台',
      logo: 'https://via.placeholder.com/80',
      milestone: '市场拓展',
      date: '2023-12-20',
      description: '我们的在线教育平台成功进入东南亚市场，首月获得超过5万新用户注册。',
      metrics: [
        { label: '新增国家', value: '3个' },
        { label: '新增用户', value: '5万+' },
        { label: '课程本地化', value: '85%' }
      ]
    },
    {
      id: '4',
      title: '获得国家高新技术企业认证',
      company: '环保回收科技',
      logo: 'https://via.placeholder.com/80',
      milestone: '资质认证',
      date: '2023-12-15',
      description: '我们的环保回收技术获得国家认可，成功获得高新技术企业认证，享受相关税收优惠政策。',
      metrics: [
        { label: '技术专利', value: '12项' },
        { label: '研发人员', value: '35人' },
        { label: '税收优惠', value: '15%' }
      ]
    }
  ];

  // 模拟数据 - 热门话题
  const topics: Topic[] = [
    {
      id: '1',
      name: 'AI创业',
      posts: 342,
      followers: 1256,
      trending: true,
      description: '探讨AI技术在各行业的创业机会、应用案例和发展趋势。'
    },
    {
      id: '2',
      name: '小微企业融资',
      posts: 256,
      followers: 987,
      trending: true,
      description: '分享小微企业和初创公司的融资渠道、策略和经验。'
    },
    {
      id: '3',
      name: '创业心理健康',
      posts: 189,
      followers: 765,
      trending: false,
      description: '关注创业者的心理健康、压力管理和工作生活平衡。'
    },
    {
      id: '4',
      name: '产品增长策略',
      posts: 423,
      followers: 1432,
      trending: true,
      description: '讨论产品增长黑客、用户留存和变现策略。'
    },
    {
      id: '5',
      name: '远程团队管理',
      posts: 278,
      followers: 892,
      trending: false,
      description: '探讨远程和分布式团队的管理方法、工具和最佳实践。'
    },
    {
      id: '6',
      name: '创业失败复盘',
      posts: 156,
      followers: 634,
      trending: false,
      description: '分享创业失败的经验教训和从失败中学习的方法。'
    },
    {
      id: '7',
      name: '出海创业',
      posts: 201,
      followers: 876,
      trending: true,
      description: '讨论中国创业公司出海的策略、挑战和成功案例。'
    },
    {
      id: '8',
      name: '社区运营',
      posts: 167,
      followers: 723,
      trending: false,
      description: '分享社区运营、用户激励和内容生态建设的经验。'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Users className="mr-2 h-8 w-8 text-primary-600" />
          创客之家
        </h1>
        <p className="text-gray-600 mt-2">
          连接创业者，分享经验，共同成长的社区平台
        </p>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 flex items-center font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'
                  }`} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 创客展示 */}
      {activeTab === 'showcase' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {makers.map(maker => (
            <div key={maker.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center">
                  <img
                    src={maker.avatar}
                    alt={maker.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary-100"
                  />
                  <div className="ml-4">
                    <h3 className="font-bold text-lg text-gray-900">{maker.name}</h3>
                    <p className="text-sm text-gray-600">{maker.title}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{maker.location}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-600 line-clamp-2">{maker.bio}</p>

                <div className="mt-4">
                  <div className="text-xs font-medium text-gray-500 mb-2">技能标签</div>
                  <div className="flex flex-wrap gap-2">
                    {maker.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <FileText className="w-4 h-4 mr-1" />
                    <span>{maker.projects} 个项目</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{maker.followers} 关注者</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 flex justify-between">
                <button className="text-sm text-primary-600 font-medium flex items-center">
                  查看详情
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
                <button className="text-sm text-gray-600 font-medium flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  关注
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 创业讨论 */}
      {activeTab === 'discussions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">最新讨论</h3>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">
              发起讨论
            </button>
          </div>

          <div className="divide-y divide-gray-200">
            {discussions.map(discussion => (
              <div key={discussion.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start">
                  <img
                    src={discussion.author.avatar}
                    alt={discussion.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="font-bold text-lg text-gray-900 hover:text-primary-600">
                      {discussion.title}
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <span>{discussion.author.name}</span>
                      <span className="mx-2">•</span>
                      <span>{discussion.date}</span>
                    </div>

                    <p className="mt-3 text-gray-600">{discussion.excerpt}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {discussion.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        <span>{discussion.replies} 回复</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{discussion.views} 浏览</span>
                      </div>
                      <div className="flex items-center">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        <span>{discussion.likes} 点赞</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 text-center">
            <button className="text-primary-600 font-medium">
              查看更多讨论
            </button>
          </div>
        </div>
      )}

      {/* 社区活动 */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-xl text-gray-800">即将举行的活动</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200">
                全部
              </button>
              <button className="px-3 py-1 bg-blue-100 rounded-full text-sm text-blue-600 hover:bg-blue-200">
                线下
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200">
                线上
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.type === 'online'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                      }`}>
                      {event.type === 'online' ? '线上' : '线下'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{event.date} {event.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span>主办方: {event.organizer}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{event.participants}</span>
                        {event.maxParticipants && (
                          <span>/{event.maxParticipants}</span>
                        )} 人参与
                      </div>
                      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">
                        报名参加
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              查看更多活动
            </button>
          </div>
        </div>
      )}

      {/* 创业成果 */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-xl text-gray-800">最新创业成果</h3>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">
              分享我的成果
            </button>
          </div>

          <div className="space-y-6">
            {achievements.map(achievement => (
              <div key={achievement.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start">
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      src={achievement.logo}
                      alt={achievement.company}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="ml-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">{achievement.title}</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-sm font-medium text-gray-700">{achievement.company}</span>
                          <span className="mx-2 text-gray-300">|</span>
                          <span className="text-sm text-gray-500">{achievement.date}</span>
                        </div>
                      </div>

                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        {achievement.milestone}
                      </span>
                    </div>

                    <p className="mt-4 text-gray-600">{achievement.description}</p>

                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {achievement.metrics.map((metric, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500">{metric.label}</p>
                          <p className="text-lg font-bold text-primary-600">{metric.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                  <div className="flex space-x-2">
                    <button className="flex items-center text-gray-500 hover:text-primary-600">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      <span>点赞</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-primary-600">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      <span>评论</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-primary-600">
                      <Star className="w-4 h-4 mr-1" />
                      <span>收藏</span>
                    </button>
                  </div>

                  <button className="text-primary-600 font-medium">
                    查看详情
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 热门话题 */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-xl text-gray-800">热门话题</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="搜索话题..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topics.map(topic => (
              <div key={topic.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg text-gray-900">#{topic.name}</h4>
                  {topic.trending && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                      热门
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm text-gray-600 line-clamp-2">{topic.description}</p>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span>{topic.posts} 帖子</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{topic.followers} 关注者</span>
                  </div>
                </div>

                <button className="mt-4 w-full py-2 border border-primary-600 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50">
                  关注话题
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MakerCommunityPage; 