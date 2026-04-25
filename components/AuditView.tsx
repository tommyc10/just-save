'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CategorizedSubscription } from '@/lib/types';
import { formatCurrency } from '@/lib/parsers';
import { calculateYearlyAmount, detectPriceChange } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { CancelHelperModal } from './CancelHelperModal';
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentIcon,
  XCircleIcon,
  QuestionCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  PiggyBankIcon,
  TrendingUpIcon,
  ExternalLinkIcon,
} from './Icons';

interface AuditViewProps {
  subscriptions: CategorizedSubscription[];
  onBack: () => void;
  onExportHTML: () => void;
}

export function AuditView({ subscriptions, onBack, onExportHTML }: AuditViewProps) {
  const [privacyMode, setPrivacyMode] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [helperTarget, setHelperTarget] = useState<CategorizedSubscription | null>(null);

  const cancelled = subscriptions.filter((s) => s.category === 'cancel');
  const investigate = subscriptions.filter((s) => s.category === 'investigate');
  const keep = subscriptions.filter((s) => s.category === 'keep');

  const yearlySavings = cancelled.reduce((sum, sub) => sum + calculateYearlyAmount(sub), 0);
  const monthlySavings = yearlySavings / 12;

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute top-8 right-8 z-20"
      >
        <ThemeToggle />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12">
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
            <span>Back to categorization</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">
                Subscription Audit
              </h1>
              <p className="text-muted-foreground text-sm">
                Found {subscriptions.length} subscriptions ·{' '}
                {subscriptions.reduce((sum, s) => sum + s.transactions.length, 0)} transactions analyzed
              </p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPrivacyMode(!privacyMode)}
                className="px-4 py-2.5 border border-border rounded-xl bg-card hover:bg-accent transition-all flex items-center gap-2 text-sm font-medium text-foreground stat-glow"
              >
                {privacyMode ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                {privacyMode ? 'Show Names' : 'Hide Names'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onExportHTML}
                className="px-4 py-2.5 bg-foreground text-background font-semibold rounded-xl btn-premium transition-all flex items-center gap-2 text-sm"
              >
                <DocumentIcon className="w-4 h-4" />
                Export HTML
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Summary Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          <StatCard icon={<XCircleIcon className="w-4 h-4 text-negative" />} tint="negative" value={cancelled.length} label="Cancelled" />
          <StatCard icon={<QuestionCircleIcon className="w-4 h-4 text-warning" />} tint="warning" value={investigate.length} label="Needs Decision" />
          <StatCard icon={<CheckCircleIcon className="w-4 h-4 text-positive" />} tint="positive" value={keep.length} label="Keeping" />

          <div className="bg-positive-muted border border-positive/20 rounded-2xl p-5 positive-glow">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-positive/20 flex items-center justify-center">
                <PiggyBankIcon className="w-4 h-4 text-positive" />
              </div>
            </div>
            <p className="font-mono text-2xl font-bold text-positive">
              {formatCurrency(yearlySavings)}
            </p>
            <p className="text-xs text-positive/70 mt-1">
              Yearly Savings ({formatCurrency(monthlySavings)}/mo)
            </p>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {cancelled.length > 0 && (
            <Section
              title="Cancelled"
              count={cancelled.length}
              colorScheme="negative"
              collapsed={collapsedSections.has('cancelled')}
              onToggle={() => toggleSection('cancelled')}
            >
              {cancelled.map((sub) => (
                <SubscriptionRow
                  key={sub.name}
                  subscription={sub}
                  privacyMode={privacyMode}
                  colorScheme="negative"
                  strikethrough
                  showCancelHelp
                  onCancelHelp={() => setHelperTarget(sub)}
                />
              ))}
            </Section>
          )}

          {investigate.length > 0 && (
            <Section
              title="Needs Decision"
              count={investigate.length}
              colorScheme="warning"
              collapsed={collapsedSections.has('investigate')}
              onToggle={() => toggleSection('investigate')}
            >
              {investigate.map((sub) => (
                <SubscriptionRow
                  key={sub.name}
                  subscription={sub}
                  privacyMode={privacyMode}
                  colorScheme="warning"
                  showCancelHelp
                  onCancelHelp={() => setHelperTarget(sub)}
                />
              ))}
            </Section>
          )}

          {keep.length > 0 && (
            <Section
              title="Keeping"
              count={keep.length}
              colorScheme="positive"
              collapsed={collapsedSections.has('keep')}
              onToggle={() => toggleSection('keep')}
            >
              {keep.map((sub) => (
                <SubscriptionRow
                  key={sub.name}
                  subscription={sub}
                  privacyMode={privacyMode}
                  colorScheme="positive"
                />
              ))}
            </Section>
          )}
        </div>
      </div>

      <CancelHelperModal subscription={helperTarget} onClose={() => setHelperTarget(null)} />
    </div>
  );
}

function StatCard({
  icon,
  tint,
  value,
  label,
}: {
  icon: React.ReactNode;
  tint: 'negative' | 'warning' | 'positive';
  value: number;
  label: string;
}) {
  const bg = {
    negative: 'bg-negative-muted',
    warning: 'bg-warning-muted',
    positive: 'bg-positive-muted',
  }[tint];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 stat-glow">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>{icon}</div>
      </div>
      <p className="font-mono text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function Section({
  title,
  count,
  colorScheme,
  collapsed,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  colorScheme: 'negative' | 'warning' | 'positive';
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const badge = {
    negative: 'bg-negative text-white',
    warning: 'bg-warning text-white',
    positive: 'bg-positive text-white',
  }[colorScheme];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:bg-accent transition-all mb-3 stat-glow"
      >
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-xl text-foreground">{title}</h2>
          <span className={`${badge} text-xs font-bold px-2.5 py-1 rounded-full`}>{count}</span>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
            collapsed ? '' : 'rotate-180'
          }`}
        />
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SubscriptionRow({
  subscription,
  privacyMode,
  colorScheme,
  strikethrough = false,
  showCancelHelp = false,
  onCancelHelp,
}: {
  subscription: CategorizedSubscription;
  privacyMode: boolean;
  colorScheme: 'negative' | 'warning' | 'positive';
  strikethrough?: boolean;
  showCancelHelp?: boolean;
  onCancelHelp?: () => void;
}) {
  const badge = {
    negative: { cls: 'bg-negative-muted text-negative', label: 'Cancelled' },
    warning: { cls: 'bg-warning-muted text-warning', label: 'Investigate' },
    positive: { cls: 'bg-positive-muted text-positive', label: 'Keep' },
  }[colorScheme];

  const yearlyAmount = calculateYearlyAmount(subscription);
  const priceChange = detectPriceChange(subscription.transactions);

  return (
    <div
      className={`bg-card border border-border rounded-xl p-4 flex items-center gap-4 transition-all ${
        strikethrough ? 'opacity-60' : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3
            className={`font-medium text-foreground ${strikethrough ? 'line-through' : ''} ${
              privacyMode ? 'blur-sm select-none' : ''
            }`}
          >
            {subscription.name}
          </h3>
          <span className={`${badge.cls} text-xs font-semibold px-2 py-0.5 rounded-full`}>
            {badge.label}
          </span>
          {priceChange && priceChange.direction === 'up' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-warning-muted text-warning">
              <TrendingUpIcon className="w-3 h-3" />
              Price up {priceChange.percentDelta.toFixed(0)}%
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="font-mono font-medium text-foreground">
            {formatCurrency(subscription.amount)}/{subscription.frequency}
          </span>
          <span>·</span>
          <span className="font-mono">{formatCurrency(yearlyAmount)}/year</span>
          {priceChange && (
            <>
              <span>·</span>
              <span className="font-mono">
                {formatCurrency(priceChange.min)} → {formatCurrency(priceChange.max)}
              </span>
            </>
          )}
          {subscription.notes && (
            <>
              <span>·</span>
              <span className="italic">{subscription.notes}</span>
            </>
          )}
        </div>
      </div>

      {showCancelHelp && onCancelHelp && (
        <button
          onClick={onCancelHelp}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
        >
          <ExternalLinkIcon className="w-3.5 h-3.5" />
          Help me cancel
        </button>
      )}
    </div>
  );
}
