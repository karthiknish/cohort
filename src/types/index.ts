export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'team' | 'client';
  avatar?: string;
  agencyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  website?: string;
  logo?: string;
  agencyId: string;
  status: 'active' | 'inactive' | 'prospect';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | string | null;
}

export interface AdAccount {
  id: string;
  clientId: string;
  platform: 'google' | 'meta' | 'tiktok' | 'linkedin';
  accountId: string;
  accountName: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: Date;
}

export interface CampaignMetrics {
  campaignId: string;
  platform: string;
  date: Date;
  budget: number;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversionRate: number;
  cpl: number;
  revenue: number;
  roas: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  assignedTo: string[];
  createdBy: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface Invoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: Date;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Proposal {
  id: string;
  clientId: string;
  title: string;
  content: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  totalAmount: number;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'image';
  channelId: string;
  createdAt: Date;
  attachments?: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
}

export interface Channel {
  id: string;
  name: string;
  type: 'client' | 'team' | 'project';
  participants: string[];
  clientId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAnalysis {
  id: string;
  type: 'performance' | 'recommendations' | 'summary' | 'forecast';
  content: string;
  clientId?: string;
  campaignIds?: string[];
  generatedAt: Date;
  confidence: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}
