'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ChangelogPage() {
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
          Changelog
        </h1>
        <p className="text-muted-foreground text-lg mb-12">Latest updates and improvements</p>

        {/* Updates */}
        <div className="space-y-12">
          {/* Update 0 - Latest */}
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-2">JANUARY 17, 2026</p>
            <h2 className="text-2xl font-bold text-foreground mb-3">Interactive Subscription Cancellation Workflow</h2>
            <p className="text-muted-foreground leading-relaxed">
              Transform passive analysis into action. After viewing results, categorize each subscription
              as Cancel, Investigate, or Keep with an intuitive batch workflow. Add notes to track your
              decisions, then view a comprehensive audit with copy-to-cancel functionality for items
              needing attention.
            </p>
            <div className="mt-6 pt-6 border-t border-border" />
          </div>

          {/* Update 1 */}
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-2">JANUARY 17, 2026</p>
            <h2 className="text-2xl font-bold text-foreground mb-3">HTML Audit Export</h2>
            <p className="text-muted-foreground leading-relaxed">
              Export your categorized subscriptions to a standalone HTML file. The interactive report
              includes collapsible sections, checkbox selection, privacy blur mode, and a built-in
              copy button—all with automatic dark mode support. Perfect for sharing or keeping records.
            </p>
            <div className="mt-6 pt-6 border-t border-border" />
          </div>

          {/* Update 2 */}
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-2">JANUARY 17, 2026</p>
            <h2 className="text-2xl font-bold text-foreground mb-3">Universal Dark Mode</h2>
            <p className="text-muted-foreground leading-relaxed">
              Extended theme toggle to all pages—Privacy, Terms, FAQ, Changelog, Contact, and Refer.
              Every page now respects your light/dark preference with smooth transitions and proper
              contrast. Theme persists across sessions and respects system preferences.
            </p>
            <div className="mt-6 pt-6 border-t border-border" />
          </div>

          {/* Update 3 */}
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-2">JANUARY 15, 2026</p>
            <h2 className="text-2xl font-bold text-foreground mb-3">Full AI-Powered Parsing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Completely refactored CSV and PDF parsing to be 100% AI-driven. No more hardcoded column
              detection or keyword matching—Claude now intelligently handles any bank statement format,
              accurately categorizes transactions, and detects subscriptions by analyzing spending patterns.
            </p>
            <div className="mt-6 pt-6 border-t border-border" />
          </div>

          {/* Update 1 */}
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-2">JANUARY 14, 2026</p>
            <h2 className="text-2xl font-bold text-foreground mb-3">Minimalist UI Refresh</h2>
            <p className="text-muted-foreground leading-relaxed">
              Complete redesign with a clean, enterprise-level aesthetic. Replaced all emojis with custom
              SVG icons, introduced a neutral gray color palette, and refined typography for a more
              professional look and feel.
            </p>
            <div className="mt-6 pt-6 border-t border-border" />
          </div>

          {/* Update 2 */}
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-2">JANUARY 14, 2026</p>
            <h2 className="text-2xl font-bold text-foreground mb-3">Smart AI Analysis</h2>
            <p className="text-muted-foreground leading-relaxed">
              Removed all hardcoded subscription detection logic. The app now relies entirely on AI to
              analyze your spending patterns, identify recurring charges, and provide personalized
              insights—making it smarter and more accurate across all banks.
            </p>
            <div className="mt-6 pt-6 border-t border-border" />
          </div>

          {/* Update 3 */}
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-2">JANUARY 13, 2026</p>
            <h2 className="text-2xl font-bold text-foreground mb-3">AI-Powered Insights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Integrated Claude AI to deliver personalized spending analysis. Get an overview of your
              habits, key insights about where your money goes, and actionable recommendations to help
              you save.
            </p>
            <div className="mt-6 pt-6 border-t border-border" />
          </div>

          {/* Update 4 */}
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-2">JANUARY 13, 2026</p>
            <h2 className="text-2xl font-bold text-foreground mb-3">Animated Dashboard</h2>
            <p className="text-muted-foreground leading-relaxed">
              Beautiful counter animations and smooth transitions make viewing your spending breakdown more
              engaging. Watch your total spending count up, then explore detailed category breakdowns with
              staggered animations.
            </p>
          </div>
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
