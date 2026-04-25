/**
 * Minimal ICS calendar file builder for cancellation follow-up reminders.
 * Produces a single all-day VEVENT the user can import into any calendar app.
 */

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toICSDate(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function toICSTimestamp(date: Date): string {
  return `${toICSDate(date)}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

interface ReminderArgs {
  subscriptionName: string;
  amount: number;
  /** Days from now for the reminder. Defaults to 35 — one billing cycle + a grace day. */
  daysFromNow?: number;
}

export function buildCancellationReminderICS({
  subscriptionName,
  amount,
  daysFromNow = 35,
}: ReminderArgs): string {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + daysFromNow);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@just-save`;
  const summary = `Confirm ${subscriptionName} cancellation`;
  const description = `Check your next bank statement for any ${subscriptionName} charge (${amount.toFixed(
    2
  )}). If you see it, the cancellation didn't stick — time to follow up.`;

  // CRLF line endings are required by RFC 5545
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//just-save//cancel-reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toICSTimestamp(new Date())}`,
    `DTSTART;VALUE=DATE:${toICSDate(start)}`,
    `DTEND;VALUE=DATE:${toICSDate(end)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(summary)}`,
    'TRIGGER:-PT9H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadICS(filename: string, ics: string) {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
