'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Analysis } from '@/lib/analyzer';
import { formatCurrency } from '@/lib/parsers';
import { ANIMATION_TIMINGS } from '@/lib/constants';
import { ChartIcon, FolderIcon, ReceiptIcon, LockIcon } from './Icons';
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

// Animated counter component
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

  return <span>{formatCurrency(displayValue)}</span>;
}

export function ResultsView({ analysis, fileName, insights, onReset, onStartCategorization }: ResultsViewProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Show breakdown after counter animation
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
    <div className="min-h-screen bg-background bg-dots relative">
      {/* Theme Toggle - positioned top right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={onReset}
            className="mb-6 text-muted-foreground hover:text-foreground text-sm font-medium flex items-center gap-2 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to upload</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                Financial Overview
              </h1>
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {fileName}
              </p>
            </div>
            <div className="hidden sm:block">
              <ChartIcon className="w-10 h-10 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Animated Total */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-foreground rounded-2xl p-8 text-center shadow-xl h-full flex flex-col justify-center">
              <p className="text-muted-foreground text-xs mb-2 uppercase tracking-widest">Total Spent</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-background mb-2">
                <AnimatedCounter value={analysis.totalSpent} />
              </h2>
              <p className="text-muted-foreground text-xs">this statement period</p>
            </div>
          </motion.div>

          {/* Quick Stats */}
          {showBreakdown && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="grid grid-cols-1 gap-3"
            >
              <div className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <FolderIcon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Categories</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{analysis.categorySpending.length}</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <ReceiptIcon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Transactions</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{totalTransactions}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* AI Insights */}
        {showBreakdown && insights && <AIInsights insights={insights} />}

        {/* Spending Distribution Chart */}
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-10"
          >
            <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground text-center mb-6">
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

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center pt-10 mt-8 border-t border-border"
        >
          <div className="bg-accent border border-border rounded-xl p-4 mb-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <LockIcon className="w-4 h-4" />
              <p className="text-sm font-medium">
                Your files are analyzed locally and immediately discarded. Nothing is stored.
              </p>
            </div>
          </div>

          {/* Categorization CTA */}
          {onStartCategorization && analysis.subscriptions.length > 0 && (
            <div className="mb-8">
              <button
                onClick={onStartCategorization}
                className="bg-foreground text-background font-bold py-4 px-8 rounded-xl hover:opacity-90 transition-opacity text-lg mb-3"
              >
                Categorize & Cancel Subscriptions →
              </button>
              <p className="text-sm text-muted-foreground">
                Decide what to cancel, keep, or investigate further
              </p>
            </div>
          )}

          <button
            onClick={onReset}
            className="mb-8 text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Analyze Another Statement
          </button>

          <Footer />
        </motion.div>
      </div>
    </div>
  );
}
