// Re-export Transaction type from centralized types
export type { Transaction } from './types';

/**
 * Parse CSV bank statement using AI
 * Handles any bank format - AI intelligently identifies columns and extracts transactions
 */
export async function parseCSV(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/parse-csv', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || 'Failed to parse CSV');
  }

  const { transactions } = await response.json();
  return transactions;
}

/**
 * Parse PDF bank statement using AI
 * Extracts transactions from unstructured PDF text
 */
export async function parsePDF(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/parse-pdf', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || 'Failed to parse PDF');
  }

  const { transactions } = await response.json();
  return transactions;
}

/**
 * Helper to format currency - defaults to GBP for UK statements
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}
