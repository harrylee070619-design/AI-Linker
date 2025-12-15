export enum UserRole {
  DEVELOPER = 'DEVELOPER',
  INVESTOR = 'INVESTOR'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  bio: string;
  tags: string[]; // Skills for Dev, Interests for Investor
  budgetRange?: string; // For Investors
  organization?: string;
}

export interface Project {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  videoUrl?: string; // Mock URL
  fundingGoal: number;
  currentFunding: number;
  likes: number;
  views: number;
  postedAt: string;
}

export interface MatchResult {
  score: number;
  reasoning: string;
  loading: boolean;
}

export type ViewState = 'HOME' | 'PROFILE' | 'DASHBOARD' | 'PROJECT_DETAIL';

export interface ChartDataPoint {
  name: string;
  value: number;
  category?: string;
}