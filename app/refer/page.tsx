'use client';

import Link from 'next/link';

export default function ReferPage() {
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
          Refer & Earn
        </h1>
        <p className="text-gray-600 text-lg mb-12">Share just save with friends and earn rewards</p>

        {/* Content */}
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Coming Soon</h2>
            <p className="text-black leading-relaxed mb-4">
              We're working on a referral program where you can earn rewards by sharing just save with your
              friends and family.
            </p>
            <p className="text-black leading-relaxed">
              Stay tuned for updates!
            </p>
          </section>

          <section className="border-2 border-dashed border-red-300 rounded-lg p-8 bg-red-50/30">
            <h3 className="text-xl font-bold text-black mb-3">Get Notified</h3>
            <p className="text-black leading-relaxed mb-4">
              Want to be the first to know when our referral program launches? We'll send you an email as soon as
              it's ready.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 border-2 border-dashed border-red-300 rounded-lg focus:outline-none focus:border-red-500"
                disabled
              />
              <button
                className="px-6 py-3 bg-gray-300 text-gray-500 font-bold rounded-lg cursor-not-allowed"
                disabled
              >
                Notify Me
              </button>
            </div>
            <p className="text-sm text-red-600 mt-3">Referral program launching soon!</p>
          </section>
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
