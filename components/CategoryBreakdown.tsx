'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderIcon, ChevronDownIcon } from './Icons';
import { formatCurrency } from '@/lib/parsers';
import { CategorySpending } from '@/lib/analyzer';
import { ANIMATION_TIMINGS } from '@/lib/constants';

interface CategoryBreakdownProps {
  categories: CategorySpending[];
}

// Premium color palette for categories
const CATEGORY_COLORS = [
  { bg: 'bg-foreground', bar: 'bg-foreground', dot: 'bg-foreground' },
  { bg: 'bg-slate-600', bar: 'bg-slate-600', dot: 'bg-slate-600' },
  { bg: 'bg-slate-500', bar: 'bg-slate-500', dot: 'bg-slate-500' },
  { bg: 'bg-slate-400', bar: 'bg-slate-400', dot: 'bg-slate-400' },
  { bg: 'bg-zinc-500', bar: 'bg-zinc-500', dot: 'bg-zinc-500' },
  { bg: 'bg-zinc-400', bar: 'bg-zinc-400', dot: 'bg-zinc-400' },
  { bg: 'bg-neutral-500', bar: 'bg-neutral-500', dot: 'bg-neutral-500' },
  { bg: 'bg-neutral-400', bar: 'bg-neutral-400', dot: 'bg-neutral-400' },
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
      transition={{ delay: 0.4, duration: 0.6 }}
      className="mb-12"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center border border-border">
          <FolderIcon className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-foreground">Spending by Category</h2>
          <p className="text-sm text-muted-foreground">{categories.length} categories detected</p>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden stat-glow">
        {categories.map((cat, idx) => {
          const isExpanded = expandedCategories.has(cat.category);
          const colorSet = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: ANIMATION_TIMINGS.CATEGORY_BASE_DELAY + idx * ANIMATION_TIMINGS.STAGGER_DELAY,
                duration: 0.3,
              }}
              className={idx !== 0 ? 'border-t border-border' : ''}
            >
              <button
                onClick={() => toggleCategory(cat.category)}
                className="w-full p-5 text-left hover:bg-accent/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colorSet.dot}`} />
                    <span className="text-foreground font-medium">{cat.category}</span>
                    <span className="text-xs text-muted-foreground bg-accent px-2.5 py-1 rounded-full font-mono">
                      {cat.transactions.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(cat.total)}
                    </span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{
                        delay:
                          ANIMATION_TIMINGS.PROGRESS_BAR_BASE_DELAY +
                          idx * ANIMATION_TIMINGS.STAGGER_DELAY,
                        duration: 0.8,
                        ease: 'easeOut',
                      }}
                      className={`h-full ${colorSet.bar} rounded-full`}
                    />
                  </div>
                  <span className="text-sm font-mono font-medium text-muted-foreground w-14 text-right">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              </button>

              {/* Expandable Transaction List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 pb-5"
                  >
                    <div className="bg-accent/50 rounded-2xl p-4 space-y-1 max-h-72 overflow-y-auto">
                      {cat.transactions.map((transaction, txIdx) => (
                        <motion.div
                          key={txIdx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: txIdx * 0.02, duration: 0.2 }}
                          className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-card transition-colors border border-transparent hover:border-border"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground text-sm font-medium truncate">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">{transaction.date}</p>
                          </div>
                          <p className="text-sm font-mono font-semibold text-foreground ml-4">
                            {formatCurrency(transaction.amount)}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
