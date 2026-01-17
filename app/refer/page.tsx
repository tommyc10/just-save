'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ReferPage() {
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
          Refer & Earn
        </h1>
        <p className="text-muted-foreground text-lg mb-12">Share just save with friends and earn rewards</p>

        {/* Content */}
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Coming Soon</h2>
            <p className="text-foreground leading-relaxed mb-4">
              We're working on a referral program where you can earn rewards by sharing just save with your
              friends and family.
            </p>
            <p className="text-foreground leading-relaxed">
              Stay tuned for updates!
            </p>
          </section>

          <section className="border border-border rounded-lg p-8 bg-accent">
            <h3 className="text-xl font-bold text-foreground mb-3">Get Notified</h3>
            <p className="text-foreground leading-relaxed mb-4">
              Want to be the first to know when our referral program launches? We'll send you an email as soon as
              it's ready.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-foreground bg-background text-foreground"
                disabled
              />
              <button
                className="px-6 py-3 bg-muted text-muted-foreground font-bold rounded-lg cursor-not-allowed"
                disabled
              >
                Notify Me
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">Referral program launching soon!</p>
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
