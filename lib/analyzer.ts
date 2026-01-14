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
  transactions: Transaction[];
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

export function detectSubscriptions(transactions: Transaction[]): Subscription[] {
  const potentialSubs = new Map<string, Transaction[]>();

  transactions
    .filter((t) => t.type === 'debit')
    .filter((t) =>
      SUBSCRIPTION_KEYWORDS.some((kw) => t.description.toLowerCase().includes(kw.toLowerCase()))
    )
    .forEach((t) => {
      const normalized = normalizeDescription(t.description);
      if (!potentialSubs.has(normalized)) potentialSubs.set(normalized, []);
      potentialSubs.get(normalized)!.push(t);
    });

  return Array.from(potentialSubs.entries())
    .filter(([_, txns]) => txns.length >= 2)
    .map(([name, txns]) => ({
      name,
      amount: txns.reduce((sum, t) => sum + t.amount, 0) / txns.length,
      frequency: 'monthly' as const,
      transactions: txns,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function categorizeSpending(transactions: Transaction[]): CategorySpending[] {
  const categoryData = new Map(
    Object.keys(CATEGORY_KEYWORDS).map((cat) => [cat, { total: 0, count: 0, transactions: [] as Transaction[] }])
  );

  transactions
    .filter((t) => t.type === 'debit')
    .forEach((t) => {
      const desc = t.description.toLowerCase();
      const category =
        Object.entries(CATEGORY_KEYWORDS).find(([_, keywords]) =>
          keywords.some((kw) => desc.includes(kw.toLowerCase()))
        )?.[0] || 'Other';

      const current = categoryData.get(category)!;
      categoryData.set(category, {
        total: current.total + t.amount,
        count: current.count + 1,
        transactions: [...current.transactions, t],
      });
    });

  const total = Array.from(categoryData.values()).reduce((sum, cat) => sum + cat.total, 0);

  return Array.from(categoryData.entries())
    .filter(([_, data]) => data.total > 0)
    .map(([category, data]) => ({
      category,
      total: data.total,
      percentage: (data.total / total) * 100,
      count: data.count,
      transactions: data.transactions,
    }))
    .sort((a, b) => b.total - a.total);
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
