'use client';

import Link from 'next/link';

export function Footer() {
  return (
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
  );
}
