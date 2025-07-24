export interface SkillProvider {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  reviewsCount: number;
  membershipLevel: MembershipLevel;
  responseRate: number;
  responseTime: string;
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  provider: SkillProvider;
  tags: string[];
  pricePerHour: number;
  featured: boolean;
  verified: boolean;
  category: string;
}

export type MembershipLevel = 'free' | 'basic' | 'pro' | 'enterprise';

export interface MembershipPlan {
  level: MembershipLevel;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  color: string;
  recommended?: boolean;
}

export interface SkillCategory {
  id: string;
  name: string;
  count?: number;
} 