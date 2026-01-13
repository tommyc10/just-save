'use client';

import Link from 'next/link';

export default function FAQPage() {
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
          FAQ
        </h1>
        <p className="text-gray-600 text-lg mb-12">Frequently asked questions</p>

        {/* Questions */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-black mb-3">Is my financial data safe?</h2>
            <p className="text-black leading-relaxed">
              Yes. Your files are analyzed and immediately discarded. We never store your bank statements or
              transaction details on our servers. Everything is processed in memory and results are stored only in
              your browser.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-black mb-3">What file formats do you support?</h2>
            <p className="text-black leading-relaxed">
              We support CSV and PDF files from any bank. Most banks allow you to export your transaction history
              in these formats.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-black mb-3">How accurate is the subscription detection?</h2>
            <p className="text-black leading-relaxed">
              Our AI analyzes transaction patterns and merchant names to identify recurring charges. While highly
              accurate, we recommend verifying the results with your bank statements.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-black mb-3">How long does analysis take?</h2>
            <p className="text-black leading-relaxed">
              Most analyses complete in under 90 seconds, depending on the size of your statement and the number
              of transactions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-black mb-3">Can I cancel subscriptions through your app?</h2>
            <p className="text-black leading-relaxed">
              Currently, we provide insights and help you identify forgotten subscriptions. You'll need to cancel
              them directly with the service provider or through your bank.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-black mb-3">Do you store my results?</h2>
            <p className="text-black leading-relaxed">
              No. Results are stored only in your browser's local storage and auto-expire after 48 hours. Clearing
              your browser data removes everything.
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
