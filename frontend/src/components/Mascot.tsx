import { useEffect, useMemo, useState } from 'react';
import type { EventType, VideoAnalytics } from '../types';
import { conversionRate, formatPercent } from '../utils/metrics';
import { starVideo } from '../utils/star';
import styles from './Mascot.module.css';

export type MascotMood = 'idle' | 'celebrate' | 'watching' | 'help';

interface Props {
  mood: MascotMood;
  videos: VideoAnalytics[];
  lastEvent?: { type: EventType; title: string } | null;
}

const TIPS = [
  'Conversion rate is add-to-carts ÷ views. We calculate it here so the definition sits next to the UI.',
  'The bars on the right are drawn to scale: watch, tap, then bag. Shorter means drop-off.',
  'Simulate traffic posts the same event your storefront would. Watch the numbers move.',
  'The clip on the left is your quiet closer. Make more of that format.',
];

export function Mascot({ mood, videos, lastEvent }: Props) {
  const [open, setOpen] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [tip, setTip] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (mood === 'celebrate' || mood === 'watching') setOpen(true);
  }, [mood]);

  const star = useMemo(() => starVideo(videos), [videos]);

  const line = useMemo(() => {
    if (mood === 'watching') return 'A shopper just walked onto the storefront. Watch the path move.';
    if (mood === 'celebrate' && lastEvent) {
      return `Nice — a ${lastEvent.type === 'add_to_cart' ? 'add to cart' : lastEvent.type} on “${lastEvent.title}”. That’s the loop working.`;
    }
    if (mood === 'help' || showTips) return TIPS[tip % TIPS.length];
    if (star) {
      const rate = formatPercent(conversionRate(star.conversions, star.views));
      return `${star.title} is your quiet closer — ${rate} of viewers added to cart.`;
    }
    return 'I’m Baggs. Tap me and I’ll translate the numbers.';
  }, [mood, lastEvent, star, tip, showTips]);

  return (
    <div className={styles.dock}>
      {open ? (
        <div className={styles.bubble} role="status">
          <p className={styles.who}>Baggs</p>
          <p className={styles.line}>{line}</p>
          <div className={styles.bubbleRow}>
            <button
              type="button"
              className={styles.ghost}
              onClick={() => {
                setShowTips(true);
                setTip((n) => n + 1);
              }}
            >
              Another tip
            </button>
            <button type="button" className={styles.ghost} onClick={() => setOpen(false)}>
              Hide
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className={`${styles.bag} ${styles[mood]} ${reduced ? styles.still : ''}`}
        aria-label={open ? 'Baggs, hide tips' : 'Baggs, show a tip'}
        onClick={() => setOpen((value) => !value)}
      >
        <BaggsSvg />
        <span className={styles.spark} aria-hidden="true" />
        <span className={`${styles.spark} ${styles.sparkTwo}`} aria-hidden="true" />
      </button>
    </div>
  );
}

function BaggsSvg() {
  return (
    <svg viewBox="0 0 88 108" width="88" height="108" aria-hidden="true">
      <ellipse cx="44" cy="100" rx="22" ry="5" fill="rgba(12, 27, 46, 0.18)" />
      <path d="M28 28c0-12 7-20 16-20s16 8 16 20" fill="none" stroke="#007de3" strokeWidth="5" strokeLinecap="round" />
      <path d="M18 34h52l-6 58H24L18 34Z" fill="#007de3" />
      <path d="M24 34h40l-5 58H29L24 34Z" fill="#1aa0f0" />
      <circle cx="34" cy="52" r="4.2" fill="#0c1b2e" />
      <circle cx="54" cy="52" r="4.2" fill="#0c1b2e" />
      <circle cx="35.4" cy="50.6" r="1.3" fill="#fff" />
      <circle cx="55.4" cy="50.6" r="1.3" fill="#fff" />
      <polygon points="40,62 56,70 40,78" fill="#fff" />
    </svg>
  );
}
