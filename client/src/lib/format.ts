/**
 * Shared display-formatting helpers. Centralized so every price/date
 * anywhere in the app renders identically — no component reinvents
 * `.toLocaleString('en-BD')` or a date format string on its own.
 */

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`;
}

export const formatCurrency = formatBDT;

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

const monthFormatter = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });

export function formatMonth(isoDate: string): string {
  return monthFormatter.format(new Date(isoDate));
}
