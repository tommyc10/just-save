'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ContactPage() {
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
          Contact
        </h1>
        <p className="text-muted-foreground text-lg mb-12">Get in touch with us</p>

        {/* Content */}
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">How can we help?</h2>
            <p className="text-foreground leading-relaxed mb-6">
              Have questions, feedback, or need support? We'd love to hear from you.
            </p>

            <div className="border border-border rounded-lg p-8 space-y-6 bg-card">
              <div>
                <label className="block text-foreground font-medium mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-foreground bg-background text-foreground transition-colors"
                />
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-foreground bg-background text-foreground transition-colors"
                />
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">Message</label>
                <textarea
                  rows={6}
                  placeholder="Tell us what's on your mind..."
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-foreground resize-none bg-background text-foreground transition-colors"
                />
              </div>

              <button className="w-full bg-foreground text-background font-bold py-4 px-6 rounded-lg hover:opacity-90 transition-opacity">
                Send Message
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Other ways to reach us</h2>
            <div className="space-y-3 text-foreground">
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
