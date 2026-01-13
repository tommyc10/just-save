'use client';

import Link from 'next/link';

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-white bg-dots">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-red-600 hover:text-red-700 font-medium mb-8"
        >
          ← Back
        </Link>

        {/* Header */}
        <h1 className="text-5xl font-bold tracking-tight text-black mb-2">
          Changelog
        </h1>
        <p className="text-gray-600 text-lg mb-12">Latest updates and improvements</p>

        {/* Updates */}
        <div className="space-y-12">
          {/* Update 1 */}
          <div>
            <p className="text-gray-600 font-medium mb-2">JANUARY 13, 2026</p>
            <h2 className="text-2xl font-bold text-black mb-3">AI-Powered Insights</h2>
            <p className="text-black leading-relaxed">
              Get personalized spending insights powered by Claude AI. Receive detailed analysis of your
              spending patterns, subscription recommendations, and actionable tips to save money.
            </p>
            <div className="mt-6 pt-6 border-t-2 border-dashed border-red-200" />
          </div>

          {/* Update 2 */}
          <div>
            <p className="text-gray-600 font-medium mb-2">JANUARY 13, 2026</p>
            <h2 className="text-2xl font-bold text-black mb-3">Animated Dashboard</h2>
            <p className="text-black leading-relaxed">
              Beautiful counter animations and smooth transitions make viewing your spending breakdown more
              engaging. Watch your total spending count up, then explore detailed breakdowns with staggered
              animations.
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t-2 border-dashed border-red-200">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/privacy" className="text-black hover:text-red-600 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-black hover:text-red-600 transition-colors">
              Terms
            </Link>
            <Link href="/faq" className="text-black hover:text-red-600 transition-colors">
              FAQ
            </Link>
            <Link href="/changelog" className="text-black hover:text-red-600 transition-colors">
              Changelog
            </Link>
            <Link href="/refer" className="text-black hover:text-red-600 transition-colors">
              Refer & Earn
            </Link>
            <Link href="/contact" className="text-black hover:text-red-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
