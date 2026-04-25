import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FREQUENCY_MULTIPLIERS: Record<string, number> = {
  weekly: 52, monthly: 12, quarterly: 4, annual: 1, yearly: 1,
};

export function calculateYearlyAmount(sub: { amount: number; frequency: string }): number {
  return sub.amount * (FREQUENCY_MULTIPLIERS[sub.frequency] ?? 12);
}

export interface PriceChange {
  min: number;
  max: number;
  direction: 'up' | 'down';
  percentDelta: number;
}

/**
 * Detect whether a subscription's transactions show a meaningful price change.
 * Returns null if amounts are effectively constant (< 2% variance) or fewer than 2 transactions.
 */
export function detectPriceChange(transactions: { amount: number }[]): PriceChange | null {
  if (!transactions || transactions.length < 2) return null;

  const amounts = transactions.map((t) => t.amount);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  if (min <= 0) return null;

  const percentDelta = ((max - min) / min) * 100;
  if (percentDelta < 2) return null;

  const firstAmount = amounts[0];
  const lastAmount = amounts[amounts.length - 1];
  const direction: 'up' | 'down' = lastAmount >= firstAmount ? 'up' : 'down';

  return { min, max, direction, percentDelta };
}
