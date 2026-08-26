import type { AnalyticsSummary } from '../types';

/** Add-to-carts / views. Lives on the client by design — the API returns raw counts. */
export function conversionRate(addToCarts: number, views: number): number | null {
  if (views <= 0) return null;
  return addToCarts / views;
}

export function formatPercent(rate: number | null): string {
  if (rate === null) return '—';
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatPrice(rupees: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function rateTone(rate: number | null): 'muted' | 'warn' | 'ok' | 'strong' {
  if (rate === null || rate === 0) return 'muted';
  if (rate < 0.05) return 'warn';
  if (rate >= 0.08) return 'strong';
  return 'ok';
}

export function summaryConversion(summary: AnalyticsSummary): number | null {
  return conversionRate(summary.conversions, summary.views);
}

/** “1 in 9 viewers added to cart” — easier to feel than 11.0%. */
export function oneInN(rate: number | null): string | null {
  if (rate === null || rate <= 0) return null;
  return `1 in ${Math.max(2, Math.round(1 / rate))} viewers added to cart`;
}
