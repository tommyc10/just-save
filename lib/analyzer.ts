import { Transaction } from './parsers';

export interface Subscription {
  name: string;
  amount: number;
  frequency: 'monthly' | 'annual' | 'unknown';
  transactions: Transaction[];
}

export interface CategorySpending {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

export interface Analysis {
  subscriptions: Subscription[];
  categorySpending: CategorySpending[];
  totalSpent: number;
}

/**
 * Common subscription keywords to detect recurring charges
 */
const SUBSCRIPTION_KEYWORDS = [
  'netflix',
  'spotify',
  'amazon prime',
  'hulu',
  'disney',
  'apple music',
  'youtube premium',
  'youtube',
  'adobe',
  'microsoft',
  'dropbox',
  'icloud',
  'gym',
  'clubwise',
  'membership',
  'subscription',
  'monthly',
  'annual',
  'recurring',
  'insurance',
  'hastings',
  'o2',
  'ee',
  'vodafone',
  'virgin',
  'bt',
  'sky',
  'american express',
  'amex',
  'dermatica',
  'loaded',
  'trading 212',
  'udemy',
];

/**
 * Category keywords for spending classification
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Food & Dining': [
    'restaurant',
    'cafe',
    'coffee',
    'doordash',
    'ubereats',
    'grubhub',
    'postmates',
    'deliveroo',
    'just eat',
    'uber eats',
    'delivery',
    'pizza',
    'burger',
    'food',
    'dining',
    'mcdonald',
    'starbucks',
    'chipotle',
    'tesco',
    'asda',
    'sainsbury',
    'waitrose',
    'morrisons',
    'aldi',
    'lidl',
    'pret',
    'greggs',
    'nando',
    'pepes',
    'peri peri',
    'canteen',
    'baxterstorey',
    'benugo',
  ],
  Entertainment: [
    'netflix',
    'spotify',
    'hulu',
    'disney',
    'movie',
    'theater',
    'cinema',
    'game',
    'steam',
    'playstation',
    'xbox',
    'nintendo',
    'youtube',
    'borough',
  ],
  Shopping: [
    'amazon',
    'target',
    'walmart',
    'ebay',
    'etsy',
    'shopping',
    'retail',
    'store',
    'paypal',
    'sweatybetty',
    'lookfantastic',
    'barretts',
    'bmw',
    'mini',
  ],
  Transportation: [
    'uber',
    'lyft',
    'gas',
    'fuel',
    'parking',
    'transit',
    'metro',
    'taxi',
    'shell',
    'chevron',
    'petrol',
    'pfs',
    'dvla',
    'car tax',
    'mot',
  ],
  'Bills & Utilities': [
    'electric',
    'water',
    'gas',
    'internet',
    'phone',
    'verizon',
    'att',
    't-mobile',
    'utility',
    'bill',
    'o2',
    'ee',
    'vodafone',
    'three',
    'virgin money',
    'virgin media',
    'bt',
    'sky',
    'mortgage',
  ],
  'Health & Fitness': [
    'gym',
    'fitness',
    'pharmacy',
    'cvs',
    'walgreens',
    'medical',
    'doctor',
    'clubwise',
    'boots',
    'dermatica',
  ],
  Software: [
    'adobe',
    'microsoft',
    'google',
    'dropbox',
    'icloud',
    'github',
    'software',
    'udemy',
    'loaded',
    'trading 212',
  ],
  Insurance: [
    'insurance',
    'hastings',
    'aviva',
    'direct line',
    'churchill',
    'admiral',
  ],
  'Credit Cards': [
    'american express',
    'amex',
    'barclaycard',
    'b/card',
    'mastercard',
    'visa',
  ],
  Other: [],
};

/**
 * Detect subscriptions from transactions
 * Looks for recurring charges with similar amounts and descriptions
 */
export function detectSubscriptions(transactions: Transaction[]): Subscription[] {
  const potentialSubs = new Map<string, Transaction[]>();

  // Group transactions by similar descriptions
  for (const transaction of transactions) {
    if (transaction.type !== 'debit') continue;

    const desc = transaction.description.toLowerCase();

    // Check if it matches subscription keywords
    const isSubKeyword = SUBSCRIPTION_KEYWORDS.some((keyword) =>
      desc.includes(keyword.toLowerCase())
    );

    if (isSubKeyword) {
      // Normalize the description to group similar ones
      const normalized = normalizeDescription(transaction.description);

      if (!potentialSubs.has(normalized)) {
        potentialSubs.set(normalized, []);
      }
      potentialSubs.get(normalized)!.push(transaction);
    }
  }

  // Filter to only recurring charges (appears 2+ times)
  const subscriptions: Subscription[] = [];

  for (const [name, txns] of potentialSubs.entries()) {
    if (txns.length >= 2) {
      // Calculate average amount
      const avgAmount = txns.reduce((sum, t) => sum + t.amount, 0) / txns.length;

      // Determine frequency based on transaction count and date range
      let frequency: 'monthly' | 'annual' | 'unknown' = 'unknown';
      if (txns.length >= 2) {
        frequency = 'monthly'; // Simplified - could calculate based on date differences
      }

      subscriptions.push({
        name,
        amount: avgAmount,
        frequency,
        transactions: txns,
      });
    }
  }

  // Sort by amount (highest first)
  return subscriptions.sort((a, b) => b.amount - a.amount);
}

/**
 * Categorize spending by industry/type
 */
export function categorizeSpending(transactions: Transaction[]): CategorySpending[] {
  const categoryTotals = new Map<string, { total: number; count: number }>();

  // Initialize all categories
  for (const category of Object.keys(CATEGORY_KEYWORDS)) {
    categoryTotals.set(category, { total: 0, count: 0 });
  }

  // Categorize each transaction
  for (const transaction of transactions) {
    if (transaction.type !== 'debit') continue;

    const desc = transaction.description.toLowerCase();
    let categorized = false;

    // Try to match with category keywords
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some((keyword) => desc.includes(keyword.toLowerCase()))) {
        const current = categoryTotals.get(category)!;
        categoryTotals.set(category, {
          total: current.total + transaction.amount,
          count: current.count + 1,
        });
        categorized = true;
        break;
      }
    }

    // If no category matched, add to "Other"
    if (!categorized) {
      const other = categoryTotals.get('Other')!;
      categoryTotals.set('Other', {
        total: other.total + transaction.amount,
        count: other.count + 1,
      });
    }
  }

  // Calculate total for percentages
  const total = Array.from(categoryTotals.values()).reduce(
    (sum, cat) => sum + cat.total,
    0
  );

  // Convert to array and filter out zero categories
  const result: CategorySpending[] = [];
  for (const [category, data] of categoryTotals.entries()) {
    if (data.total > 0) {
      result.push({
        category,
        total: data.total,
        percentage: (data.total / total) * 100,
        count: data.count,
      });
    }
  }

  // Sort by total (highest first)
  return result.sort((a, b) => b.total - a.total);
}

/**
 * Run full analysis on transactions
 */
export function analyzeTransactions(transactions: Transaction[]): Analysis {
  const subscriptions = detectSubscriptions(transactions);
  const categorySpending = categorizeSpending(transactions);

  // Calculate total spent (debits only)
  const totalSpent = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    subscriptions,
    categorySpending,
    totalSpent,
  };
}

/**
 * Normalize description for grouping
 */
function normalizeDescription(desc: string): string {
  // Remove numbers, special chars, extra spaces
  return desc
    .replace(/[0-9]/g, '')
    .replace(/[^a-zA-Z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .slice(0, 30); // Take first 30 chars
}
