'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CategorizedSubscription } from '@/lib/types';
import { formatCurrency } from '@/lib/parsers';
import { ThemeToggle } from './ThemeToggle';
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentIcon,
  CopyIcon,
  XCircleIcon,
  QuestionCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  PiggyBankIcon,
} from './Icons';

interface AuditViewProps {
  subscriptions: CategorizedSubscription[];
  onBack: () => void;
  onExportHTML: () => void;
}

export function AuditView({ subscriptions, onBack, onExportHTML }: AuditViewProps) {
  const [selectedForCancel, setSelectedForCancel] = useState<Set<string>>(new Set());
  const [privacyMode, setPrivacyMode] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState(false);

  const cancelled = subscriptions.filter((s) => s.category === 'cancel');
  const investigate = subscriptions.filter((s) => s.category === 'investigate');
  const keep = subscriptions.filter((s) => s.category === 'keep');

  const yearlySavings = cancelled.reduce((sum, sub) => {
    const yearly =
      sub.frequency === 'monthly'
        ? sub.amount * 12
        : sub.frequency === 'annual'
        ? sub.amount
        : sub.frequency === 'quarterly'
        ? sub.amount * 4
        : sub.amount * 52;
    return sum + yearly;
  }, 0);

  const monthlySavings = yearlySavings / 12;

  const toggleSection = (section: string) => {
    const updated = new Set(collapsedSections);
    if (updated.has(section)) {
      updated.delete(section);
    } else {
      updated.add(section);
    }
    setCollapsedSections(updated);
  };

  const toggleSelect = (name: string) => {
    const updated = new Set(selectedForCancel);
    if (updated.has(name)) {
      updated.delete(name);
    } else {
      updated.add(name);
    }
    setSelectedForCancel(updated);
  };

  const handleCopy = () => {
    const selected = investigate.filter((s) => selectedForCancel.has(s.name));
    const text = `Cancel these subscriptions:\n\n${selected
      .map((s) => `• ${s.name} - ${formatCurrency(s.amount)}/${s.frequency}`)
      .join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

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

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPrivacyMode(!privacyMode)}
                className="px-4 py-2.5 border border-border rounded-xl bg-card hover:bg-accent transition-all flex items-center gap-2 text-sm font-medium text-foreground stat-glow"
              >
                {privacyMode ? (
                  <EyeIcon className="w-4 h-4" />
                ) : (
                  <EyeSlashIcon className="w-4 h-4" />
                )}
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
          <div className="bg-card border border-border rounded-2xl p-5 stat-glow">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-negative-muted flex items-center justify-center">
                <XCircleIcon className="w-4 h-4 text-negative" />
              </div>
            </div>
            <p className="font-mono text-2xl font-bold text-foreground">{cancelled.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Cancelled</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 stat-glow">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-warning-muted flex items-center justify-center">
                <QuestionCircleIcon className="w-4 h-4 text-warning" />
              </div>
            </div>
            <p className="font-mono text-2xl font-bold text-foreground">{investigate.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Needs Decision</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 stat-glow">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-positive-muted flex items-center justify-center">
                <CheckCircleIcon className="w-4 h-4 text-positive" />
              </div>
            </div>
            <p className="font-mono text-2xl font-bold text-foreground">{keep.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Keeping</p>
          </div>

          <div className="bg-positive-muted border border-positive/20 rounded-2xl p-5 positive-glow">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-positive/20 flex items-center justify-center">
                <PiggyBankIcon className="w-4 h-4 text-positive" />
              </div>
            </div>
            <p className="font-mono text-2xl font-bold text-positive">{formatCurrency(yearlySavings)}</p>
            <p className="text-xs text-positive/70 mt-1">
              Yearly Savings ({formatCurrency(monthlySavings)}/mo)
            </p>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {/* Cancelled Section */}
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
                />
              ))}
            </Section>
          )}

          {/* Needs Decision Section */}
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
                  selectable
                  selected={selectedForCancel.has(sub.name)}
                  onToggleSelect={() => toggleSelect(sub.name)}
                />
              ))}
            </Section>
          )}

          {/* Keeping Section */}
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

      {/* Floating Copy Button */}
      <AnimatePresence>
        {selectedForCancel.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopy}
              className="px-8 py-4 bg-foreground text-background font-bold rounded-full shadow-2xl btn-premium transition-all flex items-center gap-3"
            >
              <CopyIcon className="w-5 h-5" />
              <span>{copySuccess ? 'Copied!' : `Copy ${selectedForCancel.size} Selected`}</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Section Component
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
  const colorClasses = {
    negative: {
      badge: 'bg-negative text-white',
      border: 'border-negative/20',
    },
    warning: {
      badge: 'bg-warning text-white',
      border: 'border-warning/20',
    },
    positive: {
      badge: 'bg-positive text-white',
      border: 'border-positive/20',
    },
  };

  const colors = colorClasses[colorScheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:bg-accent transition-all mb-3 stat-glow"
      >
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-xl text-foreground">{title}</h2>
          <span className={`${colors.badge} text-xs font-bold px-2.5 py-1 rounded-full`}>
            {count}
          </span>
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

// Subscription Row Component
function SubscriptionRow({
  subscription,
  privacyMode,
  colorScheme,
  strikethrough = false,
  selectable = false,
  selected = false,
  onToggleSelect,
}: {
  subscription: CategorizedSubscription;
  privacyMode: boolean;
  colorScheme: 'negative' | 'warning' | 'positive';
  strikethrough?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const colorClasses = {
    negative: {
      badge: 'bg-negative-muted text-negative',
      label: 'Cancelled',
    },
    warning: {
      badge: 'bg-warning-muted text-warning',
      label: 'Investigate',
    },
    positive: {
      badge: 'bg-positive-muted text-positive',
      label: 'Keep',
    },
  };

  const colors = colorClasses[colorScheme];

  const yearlyAmount =
    subscription.frequency === 'monthly'
      ? subscription.amount * 12
      : subscription.frequency === 'annual'
      ? subscription.amount
      : subscription.frequency === 'quarterly'
      ? subscription.amount * 4
      : subscription.amount * 52;

  return (
    <div
      className={`bg-card border border-border rounded-xl p-4 flex items-center gap-4 transition-all ${
        strikethrough ? 'opacity-60' : ''
      } ${selected ? 'ring-2 ring-warning ring-offset-2 ring-offset-background' : ''}`}
    >
      {selectable && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="w-5 h-5 rounded border-border accent-warning cursor-pointer"
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3
            className={`font-medium text-foreground ${strikethrough ? 'line-through' : ''} ${
              privacyMode ? 'blur-sm select-none' : ''
            }`}
          >
            {subscription.name}
          </h3>
          <span className={`${colors.badge} text-xs font-semibold px-2 py-0.5 rounded-full`}>
            {colors.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="font-mono font-medium text-foreground">
            {formatCurrency(subscription.amount)}/{subscription.frequency}
          </span>
          <span>·</span>
          <span className="font-mono">{formatCurrency(yearlyAmount)}/year</span>
          {subscription.notes && (
            <>
              <span>·</span>
              <span className="italic text-muted-foreground">{subscription.notes}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
