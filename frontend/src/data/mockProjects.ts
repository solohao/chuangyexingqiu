import { Project, ProjectStage, FundingStage, ProjectStatus, ProjectType } from '../types/project.types';

// 模拟项目数据
export const mockProjects: Project[] = [
  {
    id: '1',
    title: '智能家居控制系统',
    description: '基于IoT技术的智能家居控制平台，通过AI算法实现设备自动化管理，提供语音控制、场景模式、能耗分析等功能。目前已完成核心功能开发，正在进行硬件集成测试。',
    type: 'tech' as ProjectType,
    stage: 'mvp' as ProjectStage,
    status: 'recruiting' as ProjectStatus,
    
    founder: '张三',
    founderId: 'user_001',
    foundedAt: '2024-01-15',
    location: '北京市朝阳区',
    position: [116.4074, 39.9042],
    
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
    teamSize: 3,
    maxTeamSize: 8,
    seekingRoles: ['前端工程师', '移动端开发', 'UI设计师', '硬件工程师'],
    
    funding: {
      stage: 'seed' as FundingStage,
      raised: 100,
      seeking: 500,
      equity: 10,
      valuation: 5000
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
    
    images: [
      'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800'
    ],
    demoUrl: 'https://demo.smarthome.com',
    
    tags: ['物联网', '智能家居', '硬件创新', 'AI算法'],
    skills: ['IoT开发', 'React', 'Node.js', '嵌入式', 'UI设计'],
    
    views: 1234,
    likes: 89,
    comments: 23,
    followers: 156,
    
    contact: {
      email: 'contact@smarthome.com',
      phone: '13800138000',
      website: 'https://smarthome.com',
      social: {
        github: 'smarthome-team',
        linkedin: 'smarthome-startup'
      }
    },
    
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  
  {
    id: '2',
    title: '环保回收智能站',
    description: '城市垃圾分类智能回收系统，通过AI图像识别技术自动分类垃圾，配合积分奖励机制提高市民参与度。已在北京海淀区部署10个试点站点，回收效率提升40%。',
    type: 'environment' as ProjectType,
    stage: 'growth' as ProjectStage,
    status: 'in-progress' as ProjectStatus,
    
    founder: '李四',
    founderId: 'user_002',
    foundedAt: '2023-03-22',
    location: '北京市海淀区',
    position: [116.3138, 39.9977],
    
    team: [
      {
        id: 'member_004',
        name: '李四',
        role: '创始人/CEO',
        background: '环保NGO负责人，环境工程硕士',
        skills: ['环保技术', '项目管理', '政府关系', '可持续发展'],
        rating: 4.6
      },
      {
        id: 'member_005',
        name: '赵云',
        role: 'COO',
        background: '前物流公司运营总监，供应链专家',
        skills: ['运营管理', '供应链', '数据分析', '流程优化'],
        rating: 4.8
      },
      {
        id: 'member_006',
        name: '钱多多',
        role: 'CFO',
        background: '注册会计师，财务管理专家',
        skills: ['财务管理', '投资分析', '风险控制', '合规管理'],
        rating: 4.5
      },
      {
        id: 'member_007',
        name: '孙工',
        role: '技术总监',
        background: 'AI算法工程师，计算机视觉专家',
        skills: ['机器学习', 'Python', '图像识别', '深度学习'],
        rating: 4.9
      }
    ],
    teamSize: 4,
    maxTeamSize: 10,
    seekingRoles: ['硬件工程师', '移动端开发', '市场推广', '政府关系'],
    
    funding: {
      stage: 'angel' as FundingStage,
      raised: 300,
      seeking: 1000,
      equity: 15,
      valuation: 6667
    },
    
    progress: {
      percentage: 75,
      milestones: [
        { title: '技术方案验证', completed: true, date: '2023-06-01' },
        { title: '原型机开发', completed: true, date: '2023-09-15' },
        { title: '试点部署', completed: true, date: '2023-12-01' },
        { title: '规模化生产', completed: false },
        { title: '全市推广', completed: false }
      ]
    },
    
    images: [
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
    ],
    
    tags: ['环保', '垃圾分类', 'AI识别', '智能硬件', '可持续发展'],
    skills: ['AI算法', 'Python', '硬件设计', '移动开发', '数据分析'],
    
    views: 2156,
    likes: 145,
    comments: 67,
    followers: 234,
    
    contact: {
      email: 'contact@ecorecycle.com',
      phone: '13900139000',
      website: 'https://ecorecycle.com'
    },
    
    createdAt: '2023-03-22T09:00:00Z',
    updatedAt: '2024-01-18T11:20:00Z'
  },
  
  {
    id: '3',
    title: 'STEM在线教育平台',
    description: '专注K12阶段STEM教育的在线平台，通过互动式课程、虚拟实验室、AI个性化学习路径，提高学生科学素养。已有5000+注册用户，月活跃用户1200人。',
    type: 'education' as ProjectType,
    stage: 'growth' as ProjectStage,
    status: 'recruiting' as ProjectStatus,
    
    founder: '王五',
    founderId: 'user_003',
    foundedAt: '2023-02-10',
    location: '上海市浦东新区',
    position: [121.5, 31.23],
    
    team: [
      {
        id: 'member_008',
        name: '王五',
        role: '创始人/CEO',
        background: '前新东方教师，教育学硕士',
        skills: ['教育理论', '课程设计', '团队管理', '用户研究'],
        rating: 4.7
      },
      {
        id: 'member_009',
        name: '刘星',
        role: '教学总监',
        background: '教育学博士，STEM教育专家',
        skills: ['STEM教育', '课程开发', '教学设计', '学习评估'],
        rating: 4.8
      },
      {
        id: 'member_010',
        name: '张小花',
        role: '技术负责人',
        background: '前腾讯开发工程师，全栈开发',
        skills: ['React', 'Node.js', '数据库', '系统架构'],
        rating: 4.9
      }
    ],
    teamSize: 3,
    maxTeamSize: 12,
    seekingRoles: ['教育专家', 'UI设计师', '移动端开发', '数据分析师', '内容运营'],
    
    funding: {
      stage: 'series-a' as FundingStage,
      raised: 800,
      seeking: 3000,
      equity: 20,
      valuation: 15000
    },
    
    progress: {
      percentage: 80,
      milestones: [
        { title: '平台架构搭建', completed: true, date: '2023-05-01' },
        { title: '核心课程开发', completed: true, date: '2023-08-15' },
        { title: '用户测试验证', completed: true, date: '2023-11-01' },
        { title: '商业化运营', completed: false },
        { title: '全国市场拓展', completed: false }
      ]
    },
    
    images: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800'
    ],
    demoUrl: 'https://demo.stemedtech.com',
    
    tags: ['在线教育', 'STEM', 'K12', 'AI学习', '个性化教育'],
    skills: ['React', 'Node.js', '教育技术', 'AI算法', 'UI设计'],
    
    views: 3421,
    likes: 267,
    comments: 89,
    followers: 445,
    
    contact: {
      email: 'contact@stemedtech.com',
      phone: '13700137000',
      website: 'https://stemedtech.com',
      social: {
        linkedin: 'stemedtech-platform'
      }
    },
    
    createdAt: '2023-02-10T14:00:00Z',
    updatedAt: '2024-01-19T16:45:00Z'
  },
  
  {
    id: '4',
    title: '社区医疗服务平台',
    description: '为社区提供便捷医疗咨询和服务的平台，整合线上问诊、上门医疗、健康管理等服务。已与20家社区诊所和50位专业医生合作，服务用户超过8000人。',
    type: 'health' as ProjectType,
    stage: 'expansion' as ProjectStage,
    status: 'in-progress' as ProjectStatus,
    
    founder: '赵六',
    founderId: 'user_004',
    foundedAt: '2023-04-05',
    location: '广州市天河区',
    position: [113.3, 23.1],
    
    team: [
      {
        id: 'member_011',
        name: '赵六',
        role: '创始人/CEO',
        background: '前三甲医院副院长，医学博士',
        skills: ['医疗管理', '临床经验', '政策法规', '团队领导'],
        rating: 4.9
      },
      {
        id: 'member_012',
        name: '孙医生',
        role: '医疗总监',
        background: '心内科主任医师，20年临床经验',
        skills: ['临床诊断', '医疗质控', '医生培训', '患者沟通'],
        rating: 4.8
      },
      {
        id: 'member_013',
        name: '林工',
        role: '技术总监',
        background: '医疗信息系统专家，HIS系统架构师',
        skills: ['医疗信息化', 'Java', '数据安全', '系统集成'],
        rating: 4.7
      },
      {
        id: 'member_014',
        name: '陈运营',
        role: '运营总监',
        background: '互联网医疗运营专家',
        skills: ['用户运营', '医生运营', '数据分析', '增长策略'],
        rating: 4.6
      }
    ],
    teamSize: 4,
    maxTeamSize: 15,
    seekingRoles: ['产品经理', '移动端开发', '数据工程师', '医学顾问'],
    
    funding: {
      stage: 'series-a' as FundingStage,
      raised: 1200,
      seeking: 5000,
      equity: 18,
      valuation: 27778
    },
    
    progress: {
      percentage: 85,
      milestones: [
        { title: '平台开发完成', completed: true, date: '2023-08-01' },
        { title: '医生网络建立', completed: true, date: '2023-10-15' },
        { title: '用户规模验证', completed: true, date: '2023-12-01' },
        { title: '多城市扩张', completed: false },
        { title: '盈利模式优化', completed: false }
      ]
    },
    
    images: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800'
    ],
    
    tags: ['医疗健康', '社区服务', '远程问诊', '健康管理', '医疗信息化'],
    skills: ['医疗技术', 'Java', '移动开发', '数据分析', '用户体验'],
    
    views: 2890,
    likes: 198,
    comments: 76,
    followers: 312,
    
    contact: {
      email: 'contact@communityhealth.com',
      phone: '13600136000',
      website: 'https://communityhealth.com'
    },
    
    createdAt: '2023-04-05T11:00:00Z',
    updatedAt: '2024-01-17T13:25:00Z'
  },
  
  {
    id: '5',
    title: 'AI金融风控系统',
    description: '基于机器学习的智能风控系统，为中小企业提供信贷风险评估服务。通过多维度数据分析，提高风控准确率至95%，已服务200+金融机构。',
    type: 'finance' as ProjectType,
    stage: 'expansion' as ProjectStage,
    status: 'in-progress' as ProjectStatus,
    
    founder: '周七',
    founderId: 'user_005',
    foundedAt: '2022-11-20',
    location: '深圳市南山区',
    position: [114.05, 22.55],
    
    team: [
      {
        id: 'member_015',
        name: '周七',
        role: '创始人/CEO',
        background: '前平安科技风控专家，金融学博士',
        skills: ['风险管理', '金融建模', '团队管理', '商务拓展'],
        rating: 4.8
      },
      {
        id: 'member_016',
        name: '吴算法',
        role: 'CTO',
        background: '前腾讯AI Lab研究员，机器学习专家',
        skills: ['机器学习', 'Python', '大数据', '算法优化'],
        rating: 4.9
      },
      {
        id: 'member_017',
        name: '郑产品',
        role: '产品总监',
        background: '金融科技产品经理，B端产品专家',
        skills: ['产品设计', '用户研究', '需求分析', '项目管理'],
        rating: 4.7
      }
    ],
    teamSize: 3,
    maxTeamSize: 20,
    seekingRoles: ['数据工程师', '后端开发', '销售总监', '合规专员'],
    
    funding: {
      stage: 'series-b' as FundingStage,
      raised: 5000,
      seeking: 15000,
      equity: 12,
      valuation: 125000
    },
    
    progress: {
      percentage: 90,
      milestones: [
        { title: '算法模型开发', completed: true, date: '2023-03-01' },
        { title: '产品化封装', completed: true, date: '2023-06-15' },
        { title: '客户验证', completed: true, date: '2023-09-01' },
        { title: '规模化销售', completed: true, date: '2023-12-01' },
        { title: '国际市场拓展', completed: false }
      ]
    },
    
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'
    ],
    
    tags: ['金融科技', 'AI算法', '风险控制', '大数据', '企业服务'],
    skills: ['机器学习', 'Python', 'Java', '大数据', '金融建模'],
    
    views: 4567,
    likes: 334,
    comments: 123,
    followers: 567,
    
    contact: {
      email: 'contact@aifinrisk.com',
      phone: '13500135000',
      website: 'https://aifinrisk.com',
      social: {
        linkedin: 'aifinrisk-tech'
      }
    },
    
    createdAt: '2022-11-20T16:00:00Z',
    updatedAt: '2024-01-16T10:15:00Z'
  }
];

// 获取项目类型的中文名称
export const getProjectTypeName = (type: ProjectType): string => {
  const typeNames: Record<ProjectType, string> = {
    startup: '创业项目',
    tech: '科技创新',
    social: '社会企业',
    culture: '文化创意',
    finance: '金融科技',
    education: '教育科技',
    health: '健康医疗',
    environment: '环保项目',
    other: '其他类型'
  };
  return typeNames[type] || type;
};

// 获取项目阶段的中文名称
export const getProjectStageName = (stage: ProjectStage): string => {
  const stageNames: Record<ProjectStage, string> = {
    idea: '创意阶段',
    mvp: 'MVP阶段',
    growth: '成长阶段',
    expansion: '扩张阶段'
  };
  return stageNames[stage] || stage;
};

// 获取融资阶段的中文名称
export const getFundingStageName = (stage: FundingStage): string => {
  const stageNames: Record<FundingStage, string> = {
    'pre-seed': '种子前',
    'seed': '种子轮',
    'angel': '天使轮',
    'series-a': 'A轮',
    'series-b': 'B轮',
    'series-c': 'C轮',
    'ipo': 'IPO'
  };
  return stageNames[stage] || stage;
};

// 获取项目状态的中文名称
export const getProjectStatusName = (status: ProjectStatus): string => {
  const statusNames: Record<ProjectStatus, string> = {
    active: '活跃',
    recruiting: '招募中',
    'in-progress': '进行中',
    paused: '已暂停',
    completed: '已完成'
  };
  return statusNames[status] || status;
};