import { Transaction } from '../types';

/**
 * Clean markdown code blocks from AI response
 */
export function cleanJsonResponse(text: string): string {
  let s = text.trim();
  for (const prefix of ['```json', '```']) {
    if (s.startsWith(prefix)) { s = s.slice(prefix.length); break; }
  }
  return s.replace(/```$/, '').trim();
}

/**
 * Extract JSON array from response text
 * Handles cases where AI adds extra text around the JSON
 */
export function extractJsonArray(text: string): string {
  const cleaned = cleanJsonResponse(text);

  if (cleaned.startsWith('[')) {
    return cleaned;
  }

  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  throw new Error('No JSON array found in response');
}

/**
 * Type guard to validate transaction structure
 */
export function isValidTransaction(t: unknown): t is Transaction {
  if (!t || typeof t !== 'object') return false;
  const obj = t as Record<string, unknown>;

  return (
    typeof obj.date === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.amount === 'number' &&
    !isNaN(obj.amount) &&
    obj.amount > 0 &&
    (obj.type === 'debit' || obj.type === 'credit')
  );
}

/**
 * Parse and validate transactions from JSON string
 */
export function parseTransactions(jsonText: string): Transaction[] {
  const transactions = JSON.parse(jsonText) as unknown[];
  return transactions.filter(isValidTransaction);
}
