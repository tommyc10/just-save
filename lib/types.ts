// Core transaction type - single source of truth
export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}

// Subscription detection result
export interface Subscription {
  name: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'unknown';
  confidence?: 'high' | 'medium' | 'low';
  transactions: Transaction[];
}

// Subscription categorization types
export type SubscriptionCategory = 'cancel' | 'investigate' | 'keep';

export interface CategorizedSubscription extends Subscription {
  category?: SubscriptionCategory;
  notes?: string;
  cancelledDate?: string;
}

// Audit report for HTML export
export interface AuditReport {
  timestamp: string;
  totalSubscriptions: number;
  cancelledCount: number;
  investigateCount: number;
  keepCount: number;
  yearlySavings: number;
  monthlySavings: number;
  subscriptions: CategorizedSubscription[];
}

// Category spending breakdown
export interface CategorySpending {
  category: string;
  total: number;
  percentage: number;
  count: number;
  transactions: Transaction[];
}

// AI-generated insights
export interface AIInsights {
  overview: string;
  insight: string;
  recommendation: string;
}

// Complete analysis result
export interface Analysis {
  subscriptions: CategorizedSubscription[];
  categorySpending: CategorySpending[];
  totalSpent: number;
  insights?: AIInsights;
}

// API response types
export interface ParseResponse {
  transactions?: Transaction[];
  error?: string;
}

export interface AnalyzeResponse {
  analysis?: Analysis;
  error?: string;
}
