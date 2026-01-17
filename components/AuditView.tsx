'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CategorizedSubscription, AuditReport } from '@/lib/types';
import { formatCurrency } from '@/lib/parsers';
import { ThemeToggle } from './ThemeToggle';
import { LockIcon } from './Icons';

interface AuditViewProps {
  subscriptions: CategorizedSubscription[];
  onBack: () => void;
  onExportHTML: () => void;
}

export function AuditView({ subscriptions, onBack, onExportHTML }: AuditViewProps) {
  const [selectedForCancel, setSelectedForCancel] = useState<Set<string>>(new Set());
  const [privacyMode, setPrivacyMode] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Categorize subscriptions
  const cancelled = subscriptions.filter((s) => s.category === 'cancel');
  const investigate = subscriptions.filter((s) => s.category === 'investigate');
  const keep = subscriptions.filter((s) => s.category === 'keep');

  // Calculate savings (from cancelled subscriptions)
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
    const text = `Cancel these:\n${selected
      .map((s) => `${s.name} (${formatCurrency(s.amount)}/${s.frequency})`)
      .join('\n')}`;

    navigator.clipboard.writeText(text);

    // Show feedback
    alert('Copied to clipboard! Paste in chat to get cancellation help.');
  };

  const getYearlyAmount = (sub: CategorizedSubscription) => {
    switch (sub.frequency) {
      case 'monthly':
        return sub.amount * 12;
      case 'annual':
        return sub.amount;
      case 'quarterly':
        return sub.amount * 4;
      case 'weekly':
        return sub.amount * 52;
      default:
        return sub.amount * 12;
    }
  };

  return (
    <div className="min-h-screen bg-background bg-dots relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={onBack}
            className="mb-6 text-muted-foreground hover:text-foreground text-sm font-medium flex items-center gap-2 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to categorization</span>
          </button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Subscription Audit</h1>
              <p className="text-muted-foreground text-sm">
                Found {subscriptions.length} subscriptions · {subscriptions.reduce((sum, s) => sum + s.transactions.length, 0)} transactions
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <LockIcon className="w-4 h-4" />
                {privacyMode ? 'Show' : 'Hide'} Names
              </button>
              <button
                onClick={onExportHTML}
                className="px-4 py-2 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                Export HTML
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground mb-1">Cancelled</p>
              <p className="text-3xl font-bold text-foreground">{cancelled.length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground mb-1">Needs Decision</p>
              <p className="text-3xl font-bold text-foreground">{investigate.length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground mb-1">Yearly Savings</p>
              <p className="text-3xl font-bold text-green-500">{formatCurrency(yearlySavings)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                ({formatCurrency(monthlySavings)}/mo)
              </p>
            </div>
          </div>
        </div>

        {/* Cancelled Section */}
        {cancelled.length > 0 && (
          <Section
            title="Cancelled"
            count={cancelled.length}
            badge="green"
            collapsed={collapsedSections.has('cancelled')}
            onToggle={() => toggleSection('cancelled')}
          >
            {cancelled.map((sub) => (
              <SubscriptionRow
                key={sub.name}
                subscription={sub}
                privacyMode={privacyMode}
                badge="Cancelled"
                badgeColor="green"
              />
            ))}
          </Section>
        )}

        {/* Needs Decision Section */}
        {investigate.length > 0 && (
          <Section
            title="Needs Decision"
            count={investigate.length}
            badge="orange"
            collapsed={collapsedSections.has('investigate')}
            onToggle={() => toggleSection('investigate')}
          >
            {investigate.map((sub) => (
              <SubscriptionRow
                key={sub.name}
                subscription={sub}
                privacyMode={privacyMode}
                badge="Investigate"
                badgeColor="orange"
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
            badge="gray"
            collapsed={collapsedSections.has('keep')}
            onToggle={() => toggleSection('keep')}
          >
            {keep.map((sub) => (
              <SubscriptionRow
                key={sub.name}
                subscription={sub}
                privacyMode={privacyMode}
                badge="Keep"
                badgeColor="gray"
              />
            ))}
          </Section>
        )}
      </div>

      {/* Floating Copy Button */}
      <AnimatePresence>
        {selectedForCancel.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2"
          >
            <button
              onClick={handleCopy}
              className="px-8 py-4 bg-foreground text-background font-bold rounded-full shadow-2xl hover:opacity-90 transition-opacity flex items-center gap-3"
            >
              <span>Copy {selectedForCancel.size} Selected</span>
              <span className="text-sm opacity-75">→</span>
            </button>
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
  badge,
  collapsed,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  badge: 'green' | 'orange' | 'gray';
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const badgeColors = {
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    gray: 'bg-gray-500',
  };

  return (
    <div className="mb-8">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-accent transition-colors mb-2"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <span
            className={`${badgeColors[badge]} text-white text-xs font-bold px-2 py-1 rounded-full`}
          >
            {count}
          </span>
        </div>
        <span className="text-muted-foreground">{collapsed ? '▼' : '▲'}</span>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subscription Row Component
function SubscriptionRow({
  subscription,
  privacyMode,
  badge,
  badgeColor,
  selectable = false,
  selected = false,
  onToggleSelect,
}: {
  subscription: CategorizedSubscription;
  privacyMode: boolean;
  badge: string;
  badgeColor: 'green' | 'orange' | 'gray';
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const badgeColors = {
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    gray: 'bg-gray-500',
  };

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
      className={`bg-card border border-border rounded-lg p-4 flex items-center gap-4 ${
        badge === 'Cancelled' ? 'opacity-60' : ''
      }`}
    >
      {selectable && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="w-5 h-5 rounded border-border"
        />
      )}

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h3
            className={`font-semibold text-foreground ${badge === 'Cancelled' ? 'line-through' : ''} ${
              privacyMode ? 'blur-sm' : ''
            }`}
          >
            {subscription.name}
          </h3>
          <span
            className={`${badgeColors[badgeColor]} text-white text-xs font-bold px-2 py-1 rounded`}
          >
            {badge}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {formatCurrency(subscription.amount)}/{subscription.frequency}
          </span>
          <span>·</span>
          <span>{formatCurrency(yearlyAmount)}/year</span>
          {subscription.notes && (
            <>
              <span>·</span>
              <span className="italic">{subscription.notes}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
