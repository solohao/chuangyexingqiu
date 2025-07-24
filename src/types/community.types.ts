export interface Idea {
  id: string;
  title: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  createdAt: string;
  views: number;
  comments: number;
  upvotes: number;
  downvotes: number;
  description: string;
  tags: string[];
  isLookingForTeammates: boolean;
  rank?: number;
}

export interface SkillService {
  id: string;
  provider: {
    name: string;
    avatarUrl: string;
  };
  title: string;
  rating: number;
  reviewsCount: number;
  location: string;
  pricePerDay: number;
  tags: string[];
  description: string;
  portfolioUrl?: string;
}

// FeatureRequest类型已移动到DevCenter目录下的类型文件中
