// Re-export types from centralized types
export type {
  Transaction,
  Subscription,
  CategorySpending,
  AIInsights,
  Analysis,
} from './types';

import type { Transaction, Analysis } from './types';

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
