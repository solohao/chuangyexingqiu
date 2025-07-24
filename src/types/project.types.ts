export interface Project {
  id: string;
  name: string;
  status: '进行中' | '已完成' | '已暂停' | '招募中';
  teamSize: number;
  progress: number;
  description: string;
  lookingFor?: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
}
