'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CategorizedSubscription, SubscriptionCategory } from '@/lib/types';
import { formatCurrency } from '@/lib/parsers';
import { ThemeToggle } from './ThemeToggle';

interface CategorizationViewProps {
  subscriptions: CategorizedSubscription[];
  onComplete: (categorized: CategorizedSubscription[]) => void;
  onBack: () => void;
}

const BATCH_SIZE = 7;

const CATEGORY_INFO = {
  cancel: {
    label: 'Cancel',
    description: 'Stop this subscription immediately',
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
  },
  investigate: {
    label: 'Investigate',
    description: 'Need to decide or check contract',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
  },
  keep: {
    label: 'Keep',
    description: 'Continue paying for this',
    color: 'bg-gray-500',
    hoverColor: 'hover:bg-gray-600',
  },
};

export function CategorizationView({
  subscriptions,
  onComplete,
  onBack,
}: CategorizationViewProps) {
  const [currentBatch, setCurrentBatch] = useState(0);
  const [categorized, setCategorized] = useState<CategorizedSubscription[]>(
    subscriptions.map((sub) => ({ ...sub, category: undefined, notes: '' }))
  );
  const [notes, setNotes] = useState<Record<number, string>>({});

  const totalBatches = Math.ceil(subscriptions.length / BATCH_SIZE);
  const startIdx = currentBatch * BATCH_SIZE;
  const endIdx = Math.min(startIdx + BATCH_SIZE, subscriptions.length);
  const currentSubscriptions = subscriptions.slice(startIdx, endIdx);

  const handleCategorize = (index: number, category: SubscriptionCategory) => {
    const globalIndex = startIdx + index;
    const updated = [...categorized];
    updated[globalIndex] = {
      ...updated[globalIndex],
      category,
      notes: notes[globalIndex] || '',
    };
    setCategorized(updated);
  };

  const handleNoteChange = (index: number, note: string) => {
    const globalIndex = startIdx + index;
    setNotes({ ...notes, [globalIndex]: note });
  };

  const handleNext = () => {
    if (currentBatch < totalBatches - 1) {
      setCurrentBatch(currentBatch + 1);
    } else {
      // Final categorization - save notes
      const final = categorized.map((sub, idx) => ({
        ...sub,
        notes: notes[idx] || '',
        category: sub.category || 'keep', // Default to keep if not categorized
      }));
      onComplete(final);
    }
  };

  const handlePrevious = () => {
    if (currentBatch > 0) {
      setCurrentBatch(currentBatch - 1);
    }
  };

  const batchCategorized = currentSubscriptions.every((_, idx) => {
    const globalIndex = startIdx + idx;
    return categorized[globalIndex]?.category !== undefined;
  });

  const progress = ((currentBatch + 1) / totalBatches) * 100;

  return (
    <div className="min-h-screen bg-background bg-dots relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={onBack}
            className="mb-6 text-muted-foreground hover:text-foreground text-sm font-medium flex items-center gap-2 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to results</span>
          </button>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Categorize Your Subscriptions
          </h1>
          <p className="text-muted-foreground text-sm">
            Batch {currentBatch + 1} of {totalBatches} · {subscriptions.length} total subscriptions
          </p>

          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-foreground"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8 p-4 bg-accent border border-border rounded-xl">
          <p className="text-sm text-foreground">
            For each subscription below, choose what you want to do. You can add notes to help
            remember why you made each decision.
          </p>
        </div>

        {/* Subscriptions */}
        <div className="space-y-6 mb-8">
          {currentSubscriptions.map((subscription, idx) => {
            const globalIndex = startIdx + idx;
            const selected = categorized[globalIndex]?.category;
            const yearlyAmount =
              subscription.frequency === 'monthly'
                ? subscription.amount * 12
                : subscription.frequency === 'annual'
                ? subscription.amount
                : subscription.frequency === 'quarterly'
                ? subscription.amount * 4
                : subscription.amount * 52;

            return (
              <motion.div
                key={globalIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 shadow-sm"
              >
                {/* Subscription Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {subscription.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {formatCurrency(subscription.amount)}
                    </span>
                    <span>·</span>
                    <span>{subscription.frequency}</span>
                    <span>·</span>
                    <span>{formatCurrency(yearlyAmount)}/year</span>
                  </div>
                </div>

                {/* Category Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {(Object.keys(CATEGORY_INFO) as SubscriptionCategory[]).map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorize(idx, category)}
                      className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                        selected === category
                          ? `${CATEGORY_INFO[category].color} text-white`
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {CATEGORY_INFO[category].label}
                    </button>
                  ))}
                </div>

                {/* Notes */}
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      type="text"
                      placeholder="Add a note (optional)..."
                      value={notes[globalIndex] || ''}
                      onChange={(e) => handleNoteChange(idx, e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors text-sm"
                    />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentBatch === 0}
            className="px-6 py-3 text-muted-foreground hover:text-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!batchCategorized}
            className="px-8 py-3 bg-foreground text-background font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {currentBatch === totalBatches - 1 ? 'Complete' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
