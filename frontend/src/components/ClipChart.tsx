import { useEffect, useState } from 'react';
import { conversionRate, formatPercent } from '../utils/metrics';
import type { VideoAnalytics } from '../types';
import styles from './ClipChart.module.css';

interface Props {
  videos: VideoAnalytics[];
  highlightId?: number;
}

/** Vertical bars. Full product name wraps under each column; clip title lives in the readout. */
export function ClipChart({ videos, highlightId }: Props) {
  const rows = videos
    .map((video) => ({
      video,
      rate: conversionRate(video.conversions, video.views) ?? 0,
    }))
    .sort((a, b) => b.rate - a.rate);

  const max = Math.max(...rows.map((row) => row.rate), 0.01);
  const fallbackId = highlightId ?? rows[0]?.video.id ?? null;
  const [activeId, setActiveId] = useState<number | null>(fallbackId);

  useEffect(() => {
    setActiveId(fallbackId);
  }, [fallbackId]);

  const active = rows.find((row) => row.video.id === activeId) ?? rows[0];

  return (
    <section className={styles.wrap} aria-label="Conversion by clip">
      <header className={styles.head}>
        <h2 className={styles.title}>Conversion by clip</h2>
        <p className={styles.sub}>Hover a bar for the clip. Product names sit under the columns, wrapping so nothing is cut off.</p>
      </header>
      {rows.length === 0 ? (
        <div className={styles.empty} aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className={styles.skel} style={{ height: `${28 + (i % 5) * 14}%` }} />
          ))}
        </div>
      ) : (
        <>
          <ol className={styles.plot}>
            {rows.map(({ video, rate }) => (
              <li key={video.id} className={styles.col}>
                <button
                  type="button"
                  className={styles.hit}
                  data-star={video.id === highlightId}
                  data-active={video.id === active?.video.id}
                  style={{ ['--h' as string]: `${Math.max((rate / max) * 100, rate > 0 ? 6 : 2)}%` }}
                  onMouseEnter={() => setActiveId(video.id)}
                  onFocus={() => setActiveId(video.id)}
                  aria-label={`${video.productName}, ${video.title}, ${formatPercent(rate)}`}
                >
                  <span className={styles.pct}>{formatPercent(rate)}</span>
                  <span className={styles.bar} />
                </button>
                <p className={styles.product}>{video.productName}</p>
              </li>
            ))}
          </ol>
          {active ? (
            <p className={styles.readout} role="status">
              <span className={styles.readProduct}>{active.video.productName}</span>
              <span className={styles.readClip}>{active.video.title}</span>
              <span className={styles.readRate}>{formatPercent(active.rate)}</span>
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
