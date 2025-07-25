import { Skill, MembershipPlan, SkillCategory } from '../../types/skills.types';

export const mockCategories: SkillCategory[] = [
  { id: 'all', name: '全部' },
  { id: 'development', name: '开发技能', count: 124 },
  { id: 'design', name: '设计技能', count: 87 },
  { id: 'marketing', name: '营销技能', count: 56 },
  { id: 'business', name: '商业技能', count: 43 },
  { id: 'other', name: '其他', count: 28 }
];

export const mockSkills: Skill[] = [
  {
    id: 'skill1',
    title: 'React 前端开发',
    description: '提供专业的React前端开发服务，包括组件开发、性能优化等',
    provider: {
      id: 'provider1',
      name: '张三',
      avatarUrl: '/images/projects/avatar-1.jpg',
      rating: 4.8,
      reviewsCount: 56,
      membershipLevel: 'pro',
      responseRate: 98,
      responseTime: '24小时内'
    },
    tags: ['React', 'TypeScript', 'Redux'],
    pricePerHour: 200,
    featured: true,
    verified: true,
    category: 'development'
  },
  {
    id: 'skill2',
    title: 'UI/UX 设计',
    description: '专注于用户体验和界面设计，提供移动应用和网站的设计服务',
    provider: {
      id: 'provider2',
      name: '李四',
      avatarUrl: '/images/projects/avatar-2.jpg',
      rating: 4.9,
      reviewsCount: 78,
      membershipLevel: 'basic',
      responseRate: 95,
      responseTime: '12小时内'
    },
    tags: ['UI设计', 'UX设计', 'Figma'],
    pricePerHour: 180,
    featured: false,
    verified: true,
    category: 'design'
  },
  {
    id: 'skill3',
    title: '数字营销策略',
    description: '提供全面的数字营销策略，包括SEO、社交媒体营销和内容营销',
    provider: {
      id: 'provider3',
      name: '王五',
      avatarUrl: '/images/projects/avatar-3.jpg',
      rating: 4.7,
      reviewsCount: 42,
      membershipLevel: 'enterprise',
      responseRate: 100,
      responseTime: '6小时内'
    },
    tags: ['数字营销', 'SEO', '社交媒体'],
    pricePerHour: 250,
    featured: true,
    verified: true,
    category: 'marketing'
  },
  {
    id: 'skill4',
    title: '商业计划书撰写',
    description: '帮助创业者撰写专业的商业计划书，提高融资成功率',
    provider: {
      id: 'provider4',
      name: '赵六',
      avatarUrl: '/images/projects/avatar-4.jpg',
      rating: 4.6,
      reviewsCount: 35,
      membershipLevel: 'free',
      responseRate: 90,
      responseTime: '48小时内'
    },
    tags: ['商业计划', '融资', '创业'],
    pricePerHour: 300,
    featured: false,
    verified: false,
    category: 'business'
  }
];

export const membershipPlans: MembershipPlan[] = [
  {
    level: 'free',
    name: '免费会员',
    price: 0,
    period: 'monthly',
    features: [
      '基础问答和讨论',
      '浏览已发布的技能和需求',
      '有限的搜索功能',
      '基础个人展示页'
    ],
    color: 'gray'
  },
  {
    level: 'basic',
    name: '基础会员',
    price: 50,
    period: 'monthly',
    features: [
      '发布基础技能展示',
      '发布简单需求',
      '有限的联系方式获取',
      '高级搜索功能',
      '每月最多发布3个技能'
    ],
    color: 'blue'
  },
  {
    level: 'pro',
    name: '专业会员',
    price: 200,
    period: 'monthly',
    features: [
      '无限技能和需求发布',
      '优先展示位置',
      '完整联系方式获取',
      '技能认证标识',
      '定制化推荐',
      '专业会员标识'
    ],
    color: 'purple',
    recommended: true
  },
  {
    level: 'enterprise',
    name: '企业会员',
    price: 500,
    period: 'monthly',
    features: [
      '团队账户管理',
      '批量需求发布',
      '专属客户经理',
      '定制化人才推荐',
      '合作协议模板',
      '优先客户支持'
    ],
    color: 'green'
  }
]; 