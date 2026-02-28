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
