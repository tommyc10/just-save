'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Analysis } from '@/lib/analyzer';
import { formatCurrency } from '@/lib/parsers';
import { ANIMATION_TIMINGS } from '@/lib/constants';
import { ChartIcon, FolderIcon, ReceiptIcon, LockIcon, ArrowRightIcon, ArrowLeftIcon, WalletIcon } from './Icons';
import { AIInsights } from './AIInsights';
import { CategoryBreakdown } from './CategoryBreakdown';
import { SpendingDonutChart } from './SpendingDonutChart';
import { Footer } from './Footer';
import { ThemeToggle } from './ThemeToggle';

interface ResultsViewProps {
  analysis: Analysis;
  fileName: string;
  insights: { overview: string; insight: string; recommendation: string } | null;
  onReset: () => void;
  onStartCategorization?: () => void;
}

// Animated counter with ticker effect
function AnimatedCounter({
  value,
  duration = ANIMATION_TIMINGS.COUNTER_DURATION,
}: {
  value: number;
  duration?: number;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [count, value, duration]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => setDisplayValue(latest));
    return unsubscribe;
  }, [rounded]);

  return <span className="font-mono">{formatCurrency(displayValue)}</span>;
}

export function ResultsView({ analysis, fileName, insights, onReset, onStartCategorization }: ResultsViewProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBreakdown(true);
    }, ANIMATION_TIMINGS.BREAKDOWN_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const totalTransactions = analysis.categorySpending.reduce(
    (sum, cat) => sum + cat.transactions.length,
    0
  );

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
          className="mb-12"
        >
          <button
            onClick={onReset}
            className="mb-8 text-muted-foreground hover:text-foreground text-sm font-medium flex items-center gap-2 transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to upload</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">
                Financial Overview
              </h1>
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-positive-muted border border-positive/20">
                  <span className="w-2 h-2 bg-positive rounded-full animate-pulse" />
                  <span className="text-positive font-medium">Analysis complete</span>
                </span>
                <span className="text-muted-foreground">{fileName}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hero Stat - Total Spent */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-8"
        >
          <div className="bg-foreground rounded-3xl p-10 md:p-12 relative overflow-hidden stat-glow">
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <WalletIcon className="w-5 h-5 text-background/60" />
                <p className="text-background/60 text-sm uppercase tracking-wider font-medium">
                  Total Spent This Period
                </p>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-background leading-none">
                <AnimatedCounter value={analysis.totalSpent} />
              </h2>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12"
          >
            <div className="bg-card rounded-2xl border border-border p-6 stat-glow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <FolderIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <p className="font-mono text-3xl font-bold text-foreground mb-1">
                {analysis.categorySpending.length}
              </p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 stat-glow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <ReceiptIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <p className="font-mono text-3xl font-bold text-foreground mb-1">
                {totalTransactions}
              </p>
              <p className="text-sm text-muted-foreground">Transactions</p>
            </div>

            {analysis.subscriptions.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6 stat-glow col-span-2 md:col-span-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-warning-muted flex items-center justify-center">
                    <ChartIcon className="w-5 h-5 text-warning" />
                  </div>
                </div>
                <p className="font-mono text-3xl font-bold text-foreground mb-1">
                  {analysis.subscriptions.length}
                </p>
                <p className="text-sm text-muted-foreground">Subscriptions Found</p>
              </div>
            )}
          </motion.div>
        )}

        {/* AI Insights */}
        {showBreakdown && insights && <AIInsights insights={insights} />}

        {/* Spending Distribution Chart */}
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-12"
          >
            <div className="bg-card rounded-3xl border border-border p-8 md:p-10 stat-glow">
              <h3 className="font-serif text-2xl text-foreground text-center mb-8">
                Spending Distribution
              </h3>
              <SpendingDonutChart
                categories={analysis.categorySpending}
                totalSpent={analysis.totalSpent}
              />
            </div>
          </motion.div>
        )}

        {/* Category Breakdown */}
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <CategoryBreakdown categories={analysis.categorySpending} />
          </motion.div>
        )}

        {/* Footer Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center pt-10 mt-8 border-t border-border"
        >
          {/* Privacy Notice */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-border mb-10">
            <LockIcon className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Your data was analyzed locally and immediately discarded.
            </p>
          </div>

          {/* Categorization CTA */}
          {onStartCategorization && analysis.subscriptions.length > 0 && (
            <div className="mb-10">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onStartCategorization}
                className="bg-foreground text-background font-semibold py-5 px-10 rounded-2xl btn-premium transition-all text-lg flex items-center justify-center gap-3 mx-auto"
              >
                <span>Categorize & Cancel Subscriptions</span>
                <ArrowRightIcon className="w-5 h-5" />
              </motion.button>
              <p className="text-sm text-muted-foreground mt-4">
                Decide what to cancel, keep, or investigate further
              </p>
            </div>
          )}

          <button
            onClick={onReset}
            className="mb-10 text-muted-foreground hover:text-foreground font-medium transition-colors link-underline"
          >
            Analyze Another Statement
          </button>

          <Footer />
        </motion.div>
      </div>
    </div>
  );
}
