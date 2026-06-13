export interface Revenue {
  id: string;
  amount: number;
  currency: 'CNY' | 'USD';
  date: string;
  product: string;
  productTag: string;
  type: 'subscription' | 'oneTime' | 'advertising';
  channel: 'appStore' | 'googlePlay' | 'website' | 'direct';
  experimentId?: string;
  note?: string;
  createdAt: string;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  type: 'price' | 'channel' | 'feature';
  status: 'pending' | 'running' | 'completed';
  startDate: string;
  endDate?: string;
  targetMetric: string;
  targetValue: number;
  actualValue?: number;
  hypothesis: string;
  conclusion?: string;
  groupId?: string;
  createdBy: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Review {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'outline' | 'practice';
  tags: string[];
  visibility: 'private' | 'group';
  groupId?: string;
  authorId: string;
  authorName: string;
  experimentId?: string;
  likes: number;
  views: number;
  comments: Comment[];
  isBookmarked: boolean;
  isPendingValidation: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
}

export interface Group {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  members: Member[];
  nextReviewDate?: string;
  createdBy: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  groups: string[];
}

export interface FilterState {
  product: string[];
  type: string[];
  dateRange: [string, string];
}
