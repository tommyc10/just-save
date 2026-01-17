'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderIcon, ChevronDownIcon } from './Icons';
import { formatCurrency } from '@/lib/parsers';
import { CategorySpending } from '@/lib/analyzer';
import { ANIMATION_TIMINGS } from '@/lib/constants';

interface CategoryBreakdownProps {
  categories: CategorySpending[];
}

const CATEGORY_COLORS = [
  'bg-foreground',
  'bg-gray-700 dark:bg-gray-300',
  'bg-gray-500',
  'bg-gray-600 dark:bg-gray-400',
  'bg-gray-800 dark:bg-gray-200',
  'bg-gray-400 dark:bg-gray-500',
  'bg-gray-500',
  'bg-gray-700 dark:bg-gray-300',
];

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="mb-12"
    >
      <div className="flex items-center gap-2 mb-4">
        <FolderIcon className="w-5 h-5 text-foreground" />
        <h2 className="text-xl font-semibold text-foreground">
          Spending by Category
        </h2>
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {categories.map((cat, idx) => {
          const isExpanded = expandedCategories.has(cat.category);
          const colorClass = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: ANIMATION_TIMINGS.CATEGORY_BASE_DELAY + idx * ANIMATION_TIMINGS.STAGGER_DELAY, duration: 0.3 }}
              className={idx !== 0 ? 'border-t border-border' : ''}
            >
              <button
                onClick={() => toggleCategory(cat.category)}
                className="w-full p-4 text-left hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                    <span className="text-foreground font-medium">{cat.category}</span>
                    <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-full">
                      {cat.transactions.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">
                      {formatCurrency(cat.total)}
                    </span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 bg-accent rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ delay: ANIMATION_TIMINGS.PROGRESS_BAR_BASE_DELAY + idx * ANIMATION_TIMINGS.STAGGER_DELAY, duration: 0.6, ease: "easeOut" }}
                      className={`h-full ${colorClass} rounded-full`}
                    />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground w-14 text-right">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              </button>

              {/* Expandable transaction list */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 pb-4"
                >
                  <div className="bg-accent rounded-xl p-3 space-y-1 max-h-64 overflow-y-auto">
                    {cat.transactions.map((transaction, txIdx) => (
                      <div
                        key={txIdx}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-card transition-colors border border-transparent hover:border-border"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground ml-3">
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
