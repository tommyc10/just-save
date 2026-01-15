import { Transaction } from './parsers';

export interface Subscription {
  name: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'unknown';
  confidence?: 'high' | 'medium' | 'low';
  transactions: Transaction[];
}

export interface CategorySpending {
  category: string;
  total: number;
  percentage: number;
  count: number;
  transactions: Transaction[];
}

export interface Analysis {
  subscriptions: Subscription[];
  categorySpending: CategorySpending[];
  totalSpent: number;
  insights?: {
    overview: string;
    insight: string;
    recommendation: string;
  };
}

/**
 * Analyze transactions using AI
 * Delegates subscription detection, categorization, and insights to Claude
 */
export async function analyzeTransactions(transactions: Transaction[]): Promise<Analysis> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || 'Failed to analyze transactions');
  }

  const { analysis } = await response.json();
  return analysis;
}
