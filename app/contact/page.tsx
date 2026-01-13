'use client';

import Link from 'next/link';

export default function ContactPage() {
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
          Contact
        </h1>
        <p className="text-gray-600 text-lg mb-12">Get in touch with us</p>

        {/* Content */}
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">How can we help?</h2>
            <p className="text-black leading-relaxed mb-6">
              Have questions, feedback, or need support? We'd love to hear from you.
            </p>

            <div className="border-2 border-dashed border-red-300 rounded-lg p-8 space-y-6">
              <div>
                <label className="block text-black font-medium mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 border-2 border-dashed border-red-300 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-black font-medium mb-2">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 border-dashed border-red-300 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-black font-medium mb-2">Message</label>
                <textarea
                  rows={6}
                  placeholder="Tell us what's on your mind..."
                  className="w-full px-4 py-3 border-2 border-dashed border-red-300 rounded-lg focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <button className="w-full bg-black text-white font-bold py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors">
                Send Message
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Other ways to reach us</h2>
            <div className="space-y-3 text-black">
              <p className="flex gap-3">
                <span>•</span>
                <div>
                  <strong>Email:</strong> support@spendingclarity.com
                </div>
              </p>
              <p className="flex gap-3">
                <span>•</span>
                <div>
                  <strong>Twitter:</strong> @spendingclarity
                </div>
              </p>
            </div>
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
