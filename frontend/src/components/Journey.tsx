import type { AnalyticsSummary } from '../types';
import { formatCount, formatPercent } from '../utils/metrics';
import { Eye, Pointer, ShoppingBag } from './Icons';
import styles from './Journey.module.css';

interface Props {
  summary: AnalyticsSummary;
}

export function ShopperJourney({ summary }: Props) {
  const views = Math.max(summary.views, 0);
  const base = Math.max(views, 1);
  const clickShare = summary.clicks / base;
  const bagShare = summary.conversions / base;
  const tapRate = views > 0 ? summary.clicks / views : null;
  const tapToBag = summary.clicks > 0 ? summary.conversions / summary.clicks : null;

  const steps = [
    {
      key: 'watch',
      label: 'Watched',
      value: summary.views,
      width: views > 0 ? 1 : 0,
      hint: 'Opened a clip',
      icon: Eye,
      tone: 'start' as const,
    },
    {
      key: 'tap',
      label: 'Tapped product',
      value: summary.clicks,
      width: clickShare,
      hint: `${formatPercent(tapRate)} of viewers`,
      icon: Pointer,
      tone: 'mid' as const,
    },
    {
      key: 'bag',
      label: 'Added to bag',
      value: summary.conversions,
      width: bagShare,
      hint: `${formatPercent(tapToBag)} of taps`,
      icon: ShoppingBag,
      tone: 'end' as const,
    },
  ];

  return (
    <section className={styles.wrap} aria-label="How a shopper moves">
      <header className={styles.head}>
        <h2 className={styles.title}>How a shopper moves</h2>
        <p className={styles.sub}>Drop-off from watch to bag, drawn to scale</p>
      </header>

      <ol className={styles.steps}>
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <li key={step.key} className={styles.step} data-tone={step.tone}>
              <span className={styles.icon} aria-hidden="true">
                <Icon />
              </span>
              <div className={styles.body}>
                <div className={styles.row}>
                  <p className={styles.label}>{step.label}</p>
                  <p className={styles.value}>{formatCount(step.value)}</p>
                </div>
                <div className={styles.track} aria-hidden="true">
                  <span className={styles.fill} style={{ width: `${Math.max(step.width * 100, step.value > 0 ? 4 : 0)}%` }} />
                </div>
                <p className={styles.hint}>{step.hint}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
