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
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
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
