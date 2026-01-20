'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CategorizedSubscription, SubscriptionCategory } from '@/lib/types';
import { formatCurrency } from '@/lib/parsers';
import { ThemeToggle } from './ThemeToggle';
import { ArrowLeftIcon, ArrowRightIcon, XCircleIcon, QuestionCircleIcon, CheckCircleIcon } from './Icons';

interface CategorizationViewProps {
  subscriptions: CategorizedSubscription[];
  onComplete: (categorized: CategorizedSubscription[]) => void;
  onBack: () => void;
}

const BATCH_SIZE = 7;

const CATEGORY_CONFIG = {
  cancel: {
    label: 'Cancel',
    description: 'Stop this subscription',
    icon: XCircleIcon,
    bgColor: 'bg-negative',
    bgMuted: 'bg-negative-muted',
    textColor: 'text-negative',
    borderColor: 'border-negative/30',
    hoverBg: 'hover:bg-negative hover:text-white',
  },
  investigate: {
    label: 'Investigate',
    description: 'Need to decide later',
    icon: QuestionCircleIcon,
    bgColor: 'bg-warning',
    bgMuted: 'bg-warning-muted',
    textColor: 'text-warning',
    borderColor: 'border-warning/30',
    hoverBg: 'hover:bg-warning hover:text-white',
  },
  keep: {
    label: 'Keep',
    description: 'Continue this service',
    icon: CheckCircleIcon,
    bgColor: 'bg-positive',
    bgMuted: 'bg-positive-muted',
    textColor: 'text-positive',
    borderColor: 'border-positive/30',
    hoverBg: 'hover:bg-positive hover:text-white',
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
      const final = categorized.map((sub, idx) => ({
        ...sub,
        notes: notes[idx] || '',
        category: sub.category || 'keep',
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

  // Count categories for this batch
  const categorizedCount = currentSubscriptions.filter((_, idx) => {
    const globalIndex = startIdx + idx;
    return categorized[globalIndex]?.category !== undefined;
  }).length;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute top-8 right-8 z-20"
      >
        <ThemeToggle />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <button
            onClick={onBack}
            className="mb-8 text-muted-foreground hover:text-foreground text-sm font-medium flex items-center gap-2 transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to results</span>
          </button>

          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">
            Categorize Your Subscriptions
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Batch {currentBatch + 1} of {totalBatches}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              {subscriptions.length} total subscriptions
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent border border-border">
              <span className="font-mono font-medium text-foreground">{categorizedCount}/{currentSubscriptions.length}</span>
              <span className="text-muted-foreground">categorized</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-foreground rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Instructions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-10 p-5 bg-card border border-border rounded-2xl stat-glow"
        >
          <p className="text-foreground text-sm leading-relaxed">
            For each subscription, choose what you want to do. Categorize all items in this batch to continue.
          </p>
        </motion.div>

        {/* Subscriptions List */}
        <div className="space-y-5 mb-10">
          <AnimatePresence mode="popLayout">
            {currentSubscriptions.map((subscription, idx) => {
              const globalIndex = startIdx + idx;
              const selected = categorized[globalIndex]?.category;
              const config = selected ? CATEGORY_CONFIG[selected] : null;
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
                  key={`${currentBatch}-${globalIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className={`bg-card border rounded-2xl overflow-hidden stat-glow transition-all duration-300 ${
                    selected ? config?.borderColor : 'border-border'
                  }`}
                >
                  <div className="p-6">
                    {/* Subscription Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <h3 className="font-serif text-xl text-foreground mb-2">
                          {subscription.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="font-mono font-semibold text-foreground">
                            {formatCurrency(subscription.amount)}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground capitalize">{subscription.frequency}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground font-mono">
                            {formatCurrency(yearlyAmount)}/year
                          </span>
                        </div>
                      </div>

                      {/* Selected Badge */}
                      {selected && config && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`px-3 py-1.5 rounded-full ${config.bgMuted} ${config.textColor} text-xs font-semibold flex items-center gap-1.5`}
                        >
                          <config.icon className="w-3.5 h-3.5" />
                          {config.label}
                        </motion.div>
                      )}
                    </div>

                    {/* Category Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                      {(Object.keys(CATEGORY_CONFIG) as SubscriptionCategory[]).map((category) => {
                        const catConfig = CATEGORY_CONFIG[category];
                        const isSelected = selected === category;
                        const Icon = catConfig.icon;

                        return (
                          <motion.button
                            key={category}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCategorize(idx, category)}
                            className={`relative px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                              isSelected
                                ? `${catConfig.bgColor} text-white`
                                : `bg-accent text-muted-foreground border border-border ${catConfig.hoverBg}`
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {catConfig.label}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Notes Field */}
                    <AnimatePresence>
                      {selected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-4"
                        >
                          <input
                            type="text"
                            placeholder="Add a note (optional)..."
                            value={notes[globalIndex] || ''}
                            onChange={(e) => handleNoteChange(idx, e.target.value)}
                            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20 transition-all text-sm"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={handlePrevious}
            disabled={currentBatch === 0}
            className="px-6 py-3 text-muted-foreground hover:text-foreground font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Previous
          </button>

          <motion.button
            whileHover={batchCategorized ? { scale: 1.02 } : {}}
            whileTap={batchCategorized ? { scale: 0.98 } : {}}
            onClick={handleNext}
            disabled={!batchCategorized}
            className="px-8 py-4 bg-foreground text-background font-semibold rounded-xl btn-premium disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {currentBatch === totalBatches - 1 ? 'Complete' : 'Next'}
            <ArrowRightIcon className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
