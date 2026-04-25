/**
 * Cancellation catalog — curated deep links and gotchas for common subscriptions.
 * Matches are made by normalized substring on the subscription name.
 *
 * When adding entries: keys are the canonical service label shown to users;
 * `match` is the lowercase tokens we look for in the subscription name.
 */

export type BilledVia = 'direct' | 'apple' | 'google' | 'amazon' | 'paypal';

export interface CancelEntry {
  /** Display name shown in the UI */
  service: string;
  /** Lowercase tokens to match against a subscription's name */
  match: string[];
  /** Direct URL to the cancellation / subscription page, if one exists */
  cancelUrl?: string;
  /** How the subscription is typically billed — affects where you cancel */
  billedVia?: BilledVia;
  /** Short gotcha / warning to surface in the helper modal */
  gotcha?: string;
}

const APPLE_NOTE =
  'Apple-billed subscriptions must be cancelled in your Apple account — the app will not cancel it for you.';
const GOOGLE_NOTE =
  'Google Play subscriptions must be cancelled in the Play Store — the app will not cancel it for you.';

export const CANCEL_CATALOG: CancelEntry[] = [
  // Streaming
  { service: 'Netflix', match: ['netflix'], cancelUrl: 'https://www.netflix.com/cancelplan' },
  { service: 'Spotify', match: ['spotify'], cancelUrl: 'https://www.spotify.com/account/subscription/' },
  { service: 'Disney+', match: ['disney+', 'disneyplus', 'disney plus'], cancelUrl: 'https://www.disneyplus.com/account/subscription' },
  { service: 'Hulu', match: ['hulu'], cancelUrl: 'https://www.hulu.com/account' },
  { service: 'Max (HBO)', match: ['hbo max', 'max.com', 'hbomax'], cancelUrl: 'https://www.max.com/subscription' },
  { service: 'YouTube Premium', match: ['youtube premium', 'youtubepremium', 'google youtube'], cancelUrl: 'https://www.youtube.com/paid_memberships' },
  { service: 'Paramount+', match: ['paramount+', 'paramountplus'], cancelUrl: 'https://www.paramountplus.com/account/' },
  { service: 'Peacock', match: ['peacock'], cancelUrl: 'https://www.peacocktv.com/account/plans' },
  { service: 'Apple TV+', match: ['apple tv', 'appletv'], billedVia: 'apple', gotcha: APPLE_NOTE, cancelUrl: 'https://apps.apple.com/account/subscriptions' },
  { service: 'Amazon Prime', match: ['amazon prime', 'prime video'], cancelUrl: 'https://www.amazon.com/gp/subs/primeclub/account/homepage.html' },

  // Music
  { service: 'Apple Music', match: ['apple music', 'itunes'], billedVia: 'apple', gotcha: APPLE_NOTE, cancelUrl: 'https://apps.apple.com/account/subscriptions' },
  { service: 'Tidal', match: ['tidal'], cancelUrl: 'https://tidal.com/my-account/subscription' },
  { service: 'SoundCloud', match: ['soundcloud'], cancelUrl: 'https://soundcloud.com/settings/subscriptions' },

  // News / Reading
  { service: 'New York Times', match: ['new york times', 'nytimes', 'ny times'], cancelUrl: 'https://myaccount.nytimes.com/membercenter', gotcha: 'Cancellation may require a phone call during US business hours.' },
  { service: 'Wall Street Journal', match: ['wsj', 'wall street journal'], cancelUrl: 'https://subscriber.wsj.com/member-center' },
  { service: 'The Economist', match: ['economist'], cancelUrl: 'https://myaccount.economist.com' },
  { service: 'The Guardian', match: ['guardian'], cancelUrl: 'https://manage.theguardian.com' },
  { service: 'The Times (UK)', match: ['thetimes', 'the times'], cancelUrl: 'https://home.thetimes.com/manageMySubscription' },
  { service: 'Patreon', match: ['patreon'], cancelUrl: 'https://www.patreon.com/settings/memberships' },
  { service: 'Substack', match: ['substack'], cancelUrl: 'https://substack.com/account' },

  // Software / Productivity
  { service: 'Adobe Creative Cloud', match: ['adobe'], cancelUrl: 'https://account.adobe.com/plans', gotcha: 'Annual plans have an early-termination fee — check your contract before cancelling.' },
  { service: 'Microsoft 365', match: ['microsoft 365', 'office 365', 'microsoft subscription'], cancelUrl: 'https://account.microsoft.com/services' },
  { service: 'Dropbox', match: ['dropbox'], cancelUrl: 'https://www.dropbox.com/account/plan' },
  { service: 'Google One', match: ['google one', 'google storage'], cancelUrl: 'https://one.google.com/storage' },
  { service: 'iCloud', match: ['icloud', 'apple.com/bill'], billedVia: 'apple', gotcha: APPLE_NOTE, cancelUrl: 'https://apps.apple.com/account/subscriptions' },
  { service: 'Notion', match: ['notion'], cancelUrl: 'https://www.notion.so/my-account' },
  { service: 'Figma', match: ['figma'], cancelUrl: 'https://www.figma.com/settings/account' },
  { service: 'LinkedIn Premium', match: ['linkedin'], cancelUrl: 'https://www.linkedin.com/premium/settings/' },

  // AI
  { service: 'ChatGPT Plus', match: ['openai', 'chatgpt'], cancelUrl: 'https://chatgpt.com/#settings/Subscription' },
  { service: 'Claude Pro', match: ['anthropic', 'claude.ai'], cancelUrl: 'https://claude.ai/settings/billing' },
  { service: 'GitHub Copilot', match: ['github'], cancelUrl: 'https://github.com/settings/copilot' },

  // VPN / Security
  { service: 'NordVPN', match: ['nordvpn', 'nord vpn'], cancelUrl: 'https://my.nordaccount.com/' },
  { service: 'ExpressVPN', match: ['expressvpn', 'express vpn'], cancelUrl: 'https://www.expressvpn.com/subscriptions' },
  { service: 'Proton', match: ['proton'], cancelUrl: 'https://account.proton.me/u/0/subscription' },
  { service: '1Password', match: ['1password'], cancelUrl: 'https://my.1password.com' },

  // Gaming
  { service: 'Xbox Game Pass', match: ['xbox', 'game pass', 'gamepass'], cancelUrl: 'https://account.microsoft.com/services' },
  { service: 'PlayStation Plus', match: ['playstation', 'ps plus', 'sony'], cancelUrl: 'https://www.playstation.com/account/payment-management/' },
  { service: 'Nintendo Switch Online', match: ['nintendo'], cancelUrl: 'https://accounts.nintendo.com/' },

  // Fitness / Wellness
  { service: 'Peloton', match: ['peloton'], cancelUrl: 'https://members.onepeloton.com/preferences/subscription' },
  { service: 'ClassPass', match: ['classpass'], cancelUrl: 'https://classpass.com/account/subscription' },
  { service: 'Strava', match: ['strava'], cancelUrl: 'https://www.strava.com/settings/account' },
  { service: 'Calm', match: ['calm.com'], billedVia: 'apple', gotcha: 'Calm is often billed via Apple — check Settings > Apple ID > Subscriptions first.' },
  { service: 'Headspace', match: ['headspace'], cancelUrl: 'https://www.headspace.com/subscription', gotcha: 'If billed via Apple, cancel in iPhone Settings > Apple ID > Subscriptions instead.' },
  { service: 'Duolingo', match: ['duolingo'], cancelUrl: 'https://www.duolingo.com/settings/subscription' },

  // Dating (usually app-store billed)
  { service: 'Tinder', match: ['tinder'], billedVia: 'apple', gotcha: `${APPLE_NOTE} On Android, cancel via Google Play.` },
  { service: 'Bumble', match: ['bumble'], billedVia: 'apple', gotcha: `${APPLE_NOTE} On Android, cancel via Google Play.` },
  { service: 'Hinge', match: ['hinge'], billedVia: 'apple', gotcha: `${APPLE_NOTE} On Android, cancel via Google Play.` },

  // Generic billing platforms (catch-alls, lower priority — keep last)
  { service: 'Apple Subscription', match: ['apple.com/bill', 'itunes.com/bill'], billedVia: 'apple', gotcha: APPLE_NOTE, cancelUrl: 'https://apps.apple.com/account/subscriptions' },
  { service: 'Google Play', match: ['google *play', 'google*play', 'googleplay'], billedVia: 'google', gotcha: GOOGLE_NOTE, cancelUrl: 'https://play.google.com/store/account/subscriptions' },
];

/**
 * Find a catalog entry for a given subscription name.
 * Returns the first match by substring on any of the entry's `match` tokens.
 */
export function matchCancelEntry(subscriptionName: string): CancelEntry | null {
  const normalized = subscriptionName.toLowerCase().replace(/\s+/g, ' ').trim();
  for (const entry of CANCEL_CATALOG) {
    for (const token of entry.match) {
      if (normalized.includes(token)) return entry;
    }
  }
  return null;
}

/**
 * Build a Google search URL as a fallback for unknown services.
 */
export function fallbackSearchUrl(subscriptionName: string): string {
  const q = encodeURIComponent(`how to cancel ${subscriptionName} subscription`);
  return `https://www.google.com/search?q=${q}`;
}
