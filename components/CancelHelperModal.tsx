'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CategorizedSubscription, CancelHelp } from '@/lib/types';
import { matchCancelEntry, fallbackSearchUrl } from '@/lib/cancel-catalog';
import { formatCurrency } from '@/lib/parsers';
import { calculateYearlyAmount } from '@/lib/utils';
import { buildCancellationReminderICS, downloadICS } from '@/lib/ics';
import {
  XCircleIcon,
  ExternalLinkIcon,
  MailIcon,
  CalendarIcon,
  CopyIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from './Icons';

interface CancelHelperModalProps {
  subscription: CategorizedSubscription | null;
  onClose: () => void;
}

type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; help: CancelHelp }
  | { status: 'error'; message: string };

export function CancelHelperModal({ subscription, onClose }: CancelHelperModalProps) {
  const [fetchState, setFetchState] = useState<FetchState>({ status: 'idle' });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const entry = subscription ? matchCancelEntry(subscription.name) : null;
  const cancelUrl = entry?.cancelUrl ?? (subscription ? fallbackSearchUrl(subscription.name) : '#');

  useEffect(() => {
    if (!subscription) {
      abortRef.current?.abort();
      setFetchState({ status: 'idle' });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setFetchState({ status: 'loading' });

    fetch('/api/cancel-help', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        name: subscription.name,
        amount: subscription.amount,
        frequency: subscription.frequency,
        knownUrl: entry?.cancelUrl,
        knownGotcha: entry?.gotcha,
      }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const { error } = await r.json().catch(() => ({ error: 'Request failed' }));
          throw new Error(error);
        }
        const { help } = (await r.json()) as { help: CancelHelp };
        setFetchState({ status: 'success', help });
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setFetchState({ status: 'error', message: err.message });
      });

    return () => controller.abort();
  }, [subscription, entry?.cancelUrl, entry?.gotcha]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!subscription) return null;

  const yearly = calculateYearlyAmount(subscription);
  const help = fetchState.status === 'success' ? fetchState.help : null;

  const handleCopyEmail = () => {
    if (!help) return;
    const text = `Subject: ${help.emailSubject}\n\n${help.emailBody}`;
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleAddReminder = () => {
    const ics = buildCancellationReminderICS({
      subscriptionName: subscription.name,
      amount: subscription.amount,
    });
    const safeName = subscription.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    downloadICS(`cancel-${safeName}.ics`, ics);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-xl bg-background border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-6 border-b border-border">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                Cancel
              </p>
              <h2 className="font-serif text-2xl text-foreground truncate">
                {entry?.service ?? subscription.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-mono font-medium text-foreground">
                  {formatCurrency(subscription.amount)}
                </span>
                {' / '}
                {subscription.frequency}
                {' · '}
                <span className="font-mono">{formatCurrency(yearly)}/year saved</span>
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Primary CTA — deep link */}
            <a
              href={cancelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 w-full px-5 py-4 bg-foreground text-background rounded-2xl btn-premium font-semibold hover:opacity-90 transition-opacity"
            >
              <span className="flex items-center gap-3">
                <ExternalLinkIcon className="w-5 h-5" />
                {entry?.cancelUrl ? `Open ${entry.service} cancellation page` : 'Search how to cancel'}
              </span>
            </a>

            {/* Known gotcha from catalog */}
            {entry?.gotcha && (
              <div className="flex gap-3 p-4 bg-warning-muted border border-warning/30 rounded-2xl">
                <AlertTriangleIcon className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">{entry.gotcha}</p>
              </div>
            )}

            {/* AI-generated steps */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                Steps
              </h3>
              {fetchState.status === 'loading' && <LoadingLines />}
              {fetchState.status === 'error' && (
                <div className="p-4 bg-negative-muted border border-negative/30 rounded-xl text-sm text-negative">
                  Couldn&apos;t fetch tailored steps: {fetchState.message}. Use the link above — it opens
                  the provider&apos;s cancellation page directly.
                </div>
              )}
              {help && (
                <ol className="space-y-2">
                  {help.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-accent border border-border text-xs font-mono font-semibold text-foreground flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* AI-generated gotchas */}
            {help && help.gotchas.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                  Watch out for
                </h3>
                <ul className="space-y-2">
                  {help.gotchas.map((g, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <AlertTriangleIcon className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground leading-relaxed">{g}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Email template (fallback path) */}
            {help && help.emailBody && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Email template
                  </h3>
                  <button
                    onClick={handleCopyEmail}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedEmail ? (
                      <>
                        <CheckCircleIcon className="w-3.5 h-3.5 text-positive" />
                        Copied
                      </>
                    ) : (
                      <>
                        <CopyIcon className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                  <div className="flex gap-2 items-baseline">
                    <MailIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <p className="text-sm font-medium text-foreground">{help.emailSubject}</p>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pl-6">
                    {help.emailBody}
                  </p>
                </div>
              </section>
            )}

            {/* Calendar reminder */}
            <section className="pt-2 border-t border-border">
              <button
                onClick={handleAddReminder}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border rounded-xl hover:bg-accent transition-colors text-sm font-medium text-foreground"
              >
                <CalendarIcon className="w-4 h-4" />
                Add 35-day follow-up reminder (.ics)
              </button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                We&apos;ll remind you to check next month&apos;s statement — so you know the
                cancellation actually stuck.
              </p>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function LoadingLines() {
  return (
    <div className="space-y-2" aria-label="Loading steps">
      {[90, 80, 95, 70].map((w, i) => (
        <div
          key={i}
          className="h-3 rounded bg-accent animate-pulse"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}
