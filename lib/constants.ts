// AI Configuration
export const AI_CONFIG = {
  MODEL: 'claude-sonnet-4-20250514',
  MAX_TOKENS: 8192,
} as const;

// File Processing Limits
export const FILE_LIMITS = {
  MAX_CSV_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  MAX_PDF_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_TEXT_LENGTH: 100000, // ~100KB for AI processing
} as const;

// Animation Timings (for Framer Motion)
export const ANIMATION_TIMINGS = {
  COUNTER_DURATION: 2, // seconds for AnimatedCounter
  BREAKDOWN_DELAY: 2500, // ms before showing breakdown
  STAGGER_DELAY: 0.05, // seconds between category items
  CATEGORY_BASE_DELAY: 0.6, // seconds before first category animates
  PROGRESS_BAR_BASE_DELAY: 0.7, // seconds before progress bars start
} as const;

// Supported File Types
export const SUPPORTED_FILE_TYPES = {
  CSV: ['text/csv', '.csv'],
  PDF: ['application/pdf', '.pdf'],
} as const;

// Spending Categories used in analysis
export const SPENDING_CATEGORIES = [
  'Food & Dining',
  'Entertainment',
  'Shopping',
  'Transportation',
  'Bills & Utilities',
  'Health & Fitness',
  'Software & Tech',
  'Insurance',
  'Travel',
  'Personal Care',
  'Education',
  'Transfers & Payments',
  'Other',
] as const;
