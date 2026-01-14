'use client';

import Link from 'next/link';

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-white bg-dots">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-500 hover:text-gray-900 font-medium mb-8 transition-colors"
        >
          ← Back
        </Link>

        {/* Header */}
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-2">
          Changelog
        </h1>
        <p className="text-gray-500 text-lg mb-12">Latest updates and improvements</p>

        {/* Updates */}
        <div className="space-y-12">
          {/* Update 1 */}
          <div>
            <p className="text-gray-500 text-sm font-medium mb-2">JANUARY 14, 2026</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Minimalist UI Refresh</h2>
            <p className="text-gray-600 leading-relaxed">
              Complete redesign with a clean, enterprise-level aesthetic. Replaced all emojis with custom
              SVG icons, introduced a neutral gray color palette, and refined typography for a more
              professional look and feel.
            </p>
            <div className="mt-6 pt-6 border-t border-gray-200" />
          </div>

          {/* Update 2 */}
          <div>
            <p className="text-gray-500 text-sm font-medium mb-2">JANUARY 14, 2026</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Smart AI Analysis</h2>
            <p className="text-gray-600 leading-relaxed">
              Removed all hardcoded subscription detection logic. The app now relies entirely on AI to
              analyze your spending patterns, identify recurring charges, and provide personalized
              insights—making it smarter and more accurate across all banks.
            </p>
            <div className="mt-6 pt-6 border-t border-gray-200" />
          </div>

          {/* Update 3 */}
          <div>
            <p className="text-gray-500 text-sm font-medium mb-2">JANUARY 13, 2026</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">AI-Powered Insights</h2>
            <p className="text-gray-600 leading-relaxed">
              Integrated Claude AI to deliver personalized spending analysis. Get an overview of your
              habits, key insights about where your money goes, and actionable recommendations to help
              you save.
            </p>
            <div className="mt-6 pt-6 border-t border-gray-200" />
          </div>

          {/* Update 4 */}
          <div>
            <p className="text-gray-500 text-sm font-medium mb-2">JANUARY 13, 2026</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Animated Dashboard</h2>
            <p className="text-gray-600 leading-relaxed">
              Beautiful counter animations and smooth transitions make viewing your spending breakdown more
              engaging. Watch your total spending count up, then explore detailed category breakdowns with
              staggered animations.
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-900 transition-colors">
              Terms
            </Link>
            <Link href="/faq" className="text-gray-500 hover:text-gray-900 transition-colors">
              FAQ
            </Link>
            <Link href="/changelog" className="text-gray-500 hover:text-gray-900 transition-colors">
              Changelog
            </Link>
            <Link href="/refer" className="text-gray-500 hover:text-gray-900 transition-colors">
              Refer & Earn
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-900 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
