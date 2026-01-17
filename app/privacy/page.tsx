'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background bg-dots relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground font-medium mb-8 transition-colors"
        >
          ← Back
        </Link>

        {/* Header */}
        <h1 className="text-5xl font-bold tracking-tight text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-lg mb-12">Last updated: January 2026</p>

        {/* Content */}
        <div className="space-y-12">
          {/* The Short Version */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The Short Version</h2>
            <p className="text-foreground leading-relaxed mb-4">
              <strong>We don't store your financial data.</strong> Your statements are analyzed and immediately
              discarded. Results are stored only in your browser's local storage, not on our servers.
            </p>
          </section>

          {/* What We Process */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What We Process</h2>
            <ul className="space-y-3 text-foreground">
              <li className="flex gap-3">
                <span>•</span>
                <div>
                  <strong>CSV Files:</strong> Analyzed by AI to identify subscriptions. Files are processed in memory and
                  never saved to disk or database.
                </div>
              </li>
              <li className="flex gap-3">
                <span>•</span>
                <div>
                  <strong>PDF Files:</strong> Processed client-side in your browser. Never uploaded to our servers.
                </div>
              </li>
            </ul>
          </section>

          {/* Zero-Storage Architecture */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Zero-Storage Architecture</h2>
            <p className="text-foreground leading-relaxed mb-4">
              After analysis, your subscription results are sent directly to your browser and stored in{' '}
              <code className="bg-muted px-2 py-1 rounded text-sm">localStorage</code>. This means:
            </p>
            <ul className="space-y-2 text-foreground">
              <li className="flex gap-3">
                <span>•</span>
                <div>Your data never touches our database</div>
              </li>
              <li className="flex gap-3">
                <span>•</span>
                <div>Only you can access your results</div>
              </li>
              <li className="flex gap-3">
                <span>•</span>
                <div>Data auto-expires after 48 hours</div>
              </li>
              <li className="flex gap-3">
                <span>•</span>
                <div>Clearing your browser data removes everything</div>
              </li>
            </ul>
          </section>

          {/* What We Do Store */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What We Do Store</h2>
            <ul className="space-y-3 text-foreground">
              <li className="flex gap-3">
                <span>•</span>
                <div>
                  <strong>Anonymous Usage Stats:</strong> Basic analytics to improve the service (no personal data)
                </div>
              </li>
              <li className="flex gap-3">
                <span>•</span>
                <div>
                  <strong>Rate Limits:</strong> Hashed IP addresses to prevent abuse (not reversible to actual IPs)
                </div>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link href="/changelog" className="text-muted-foreground hover:text-foreground transition-colors">
              Changelog
            </Link>
            <Link href="/refer" className="text-muted-foreground hover:text-foreground transition-colors">
              Refer & Earn
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
