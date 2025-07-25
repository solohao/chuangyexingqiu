export interface FeatureRequest {
  id: string;
  title: string;
  points: number;
  status: '待评估' | '开发中' | '已完成' | '已拒绝';
  submitter: {
    name: string;
    avatarUrl: string;
  };
  createdAt: string;
  description: string;
  tags: string[];
  commentsCount: number;
  rank?: number;
}

export interface DevProject {
  id: string;
  name: string;
  description: string;
  status: '计划中' | '开发中' | '已完成' | '已暂停';
  progress: number;
  startDate: string;
  endDate?: string;
  team: {
    id: string;
    name: string;
    avatarUrl: string;
    role: string;
  }[];
  tags: string[];
} 