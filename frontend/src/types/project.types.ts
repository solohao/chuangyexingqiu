// 项目相关类型定义

export type ProjectStage = 'idea' | 'mvp' | 'growth' | 'expansion';
export type FundingStage = 'pre-seed' | 'seed' | 'angel' | 'series-a' | 'series-b' | 'series-c' | 'ipo';
export type ProjectStatus = 'active' | 'recruiting' | 'in-progress' | 'paused' | 'completed';
export type ProjectType = 'startup' | 'tech' | 'social' | 'culture' | 'finance' | 'education' | 'health' | 'environment' | 'other';
export type ProjectCategory = 'technology' | 'business' | 'design' | 'marketing' | 'finance' | 'education' | 'health' | 'social' | 'environment' | 'other';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  background: string;
  avatar?: string;
  skills: string[];
  rating?: number;
}

export interface FundingInfo {
  stage: FundingStage;
  raised: number; // 已融资金额（万元）
  seeking: number; // 目标融资（万元）
  equity: number; // 出让股权百分比
  valuation?: number; // 估值（万元）
}

export interface ProjectProgress {
  percentage: number;
  milestones: {
    title: string;
    completed: boolean;
    date?: string;
  }[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  stage: ProjectStage;
  status: ProjectStatus;
  
  // 基本信息
  founder: string;
  founderId: string;
  foundedAt: string;
  location: string;
  position: [number, number];
  
  // 团队信息
  team: TeamMember[];
  teamSize: number;
  maxTeamSize: number;
  seekingRoles: string[];
  
  // 融资信息
  funding: FundingInfo;
  
  // 项目进展
  progress: ProjectProgress;
  
  // 媒体资源
  images: string[];
  videos?: string[];
  demoUrl?: string;
  websiteUrl?: string;
  
  // 标签和分类
  tags: string[];
  skills: string[];
  
  // 统计数据
  views: number;
  likes: number;
  comments: number;
  followers: number;
  
  // 联系信息
  contact: {
    email: string;
    phone?: string;
    website?: string;
    social?: {
      github?: string;
      linkedin?: string;
      twitter?: string;
    };
  };
  
  // 时间戳
  createdAt: string;
  updatedAt: string;
}

// 筛选条件类型
export interface ProjectFilters {
  search: string;
  type: ProjectType | 'all';
  stage: ProjectStage | 'all';
  fundingStage: FundingStage | 'all';
  location: string;
  teamSize: {
    min: number;
    max: number;
  };
  skills: string[];
  tags: string[];
}

// 排序选项
export type ProjectSortBy = 'latest' | 'popular' | 'funding' | 'progress' | 'team-completion';

// 视图模式
export type ProjectViewMode = 'grid' | 'list' | 'table';