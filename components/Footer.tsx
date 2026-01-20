'use client';

import Link from 'next/link';

const footerLinks = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/faq', label: 'FAQ' },
  { href: '/changelog', label: 'Changelog' },
  { href: '/refer', label: 'Refer & Earn' },
  { href: '/contact', label: 'Contact' },
];

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2">
        {footerLinks.map((link, index) => (
          <span key={link.href} className="flex items-center">
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline px-2 py-1"
            >
              {link.label}
            </Link>
            {index < footerLinks.length - 1 && (
              <span className="text-border">·</span>
            )}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground/60">
        Built with care. Your data stays yours.
      </p>
    </footer>
  );
}
