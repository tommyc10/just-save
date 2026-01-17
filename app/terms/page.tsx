'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-lg mb-12">Last updated: January 2026</p>

        {/* Content */}
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Acceptance of Terms</h2>
            <p className="text-foreground leading-relaxed">
              By using just save, you agree to these terms. If you don't agree, please don't use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Use of Service</h2>
            <p className="text-foreground leading-relaxed mb-4">
              just save is a tool to analyze your bank statements and identify subscriptions. You agree to:
            </p>
            <ul className="space-y-2 text-foreground">
              <li className="flex gap-3">
                <span>•</span>
                <div>Upload only your own financial data</div>
              </li>
              <li className="flex gap-3">
                <span>•</span>
                <div>Use the service for personal, non-commercial purposes</div>
              </li>
              <li className="flex gap-3">
                <span>•</span>
                <div>Not attempt to reverse engineer or abuse the service</div>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Disclaimer</h2>
            <p className="text-foreground leading-relaxed">
              just save provides analysis for informational purposes only. We make no guarantees about the
              accuracy of subscription detection or spending categorization. Always verify results with your bank.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Limitation of Liability</h2>
            <p className="text-foreground leading-relaxed">
              We are not liable for any decisions you make based on the analysis provided. Use the service at your
              own risk.
            </p>
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
