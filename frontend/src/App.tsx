import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAnalytics, fetchVideos, postEvent } from './api/client';
import styles from './App.module.css';
import type {
  AnalyticsSummary,
  CreatedEvent,
  PaginationMeta,
  SortBy,
  SortOrder,
  VideoAnalytics,
  VideoOption,
} from './types';
import {
  conversionRate,
  formatCount,
  formatPercent,
  formatPrice,
  rateTone,
  summaryConversion,
} from './utils/metrics';
import { eventLabel, randomEventType, randomVideo } from './utils/simulate';

const PAGE_SIZE = 8;
const EMPTY_SUMMARY: AnalyticsSummary = { videos: 0, views: 0, clicks: 0, conversions: 0 };

function PlayMark() {
  return (
    <svg className={styles.mark} viewBox="0 0 16 16" aria-hidden="true">
      <rect width="16" height="16" rx="4" fill="#1c1a24" />
      <polygon points="6,4 12,8 6,12" fill="#e23b2c" />
    </svg>
  );
}

function SortHeader({
  label,
  column,
  sortBy,
  sortOrder,
  numeric,
  onSort,
}: {
  label: string;
  column: SortBy;
  sortBy: SortBy;
  sortOrder: SortOrder;
  numeric?: boolean;
  onSort: (column: SortBy) => void;
}) {
  const active = sortBy === column;
  return (
    <th className={numeric ? styles.num : undefined} scope="col">
      <button
        type="button"
        className={styles.sort}
        onClick={() => onSort(column)}
        aria-label={`Sort by ${label}`}
      >
        {label}
        <span aria-hidden="true">{active ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</span>
      </button>
    </th>
  );
}

export default function App() {
  const [videos, setVideos] = useState<VideoAnalytics[]>([]);
  const [catalog, setCatalog] = useState<VideoOption[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>(EMPTY_SUMMARY);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('views');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: { cancelled: boolean }) => {
      setError(null);
      const data = await fetchAnalytics({ page, limit: PAGE_SIZE, sortBy, sortOrder });
      if (signal?.cancelled) return data;
      setVideos(data.videos);
      setSummary(data.summary);
      setPagination(data.pagination);
      return data;
    },
    [page, sortBy, sortOrder]
  );

  useEffect(() => {
    const signal = { cancelled: false };
    (async () => {
      setLoading(true);
      try {
        await load(signal);
      } catch (err) {
        if (!signal.cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load analytics');
        }
      } finally {
        if (!signal.cancelled) setLoading(false);
      }
    })();
    return () => {
      signal.cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    fetchVideos()
      .then((data) => setCatalog(data.videos))
      .catch(() => {
        /* table still works without the catalog; simulate will no-op */
      });
  }, []);

  const storeCvr = useMemo(() => summaryConversion(summary), [summary]);

  function handleSort(column: SortBy) {
    if (sortBy === column) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder(column === 'title' || column === 'productName' ? 'asc' : 'desc');
    }
    setPage(1);
  }

  async function simulateTraffic() {
    if (catalog.length === 0) {
      setError('No videos available to simulate traffic against.');
      return;
    }

    const video = randomVideo(catalog);
    const eventType = randomEventType();
    setSimulating(true);
    setError(null);

    try {
      const { event } = await postEvent({ videoId: video.id, eventType });
      setNotice(describeEvent(event, video.title));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ingest event');
    } finally {
      setSimulating(false);
    }
  }

  const from = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const to = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <PlayMark />
          <div>
            <div className={styles.brandName}>Videoselz</div>
            <span className={styles.brandMeta}>Merchant admin</span>
          </div>
        </div>
        <nav className={styles.nav} aria-label="Primary">
          <button type="button" className={styles.navItem} aria-current="page">
            Performance
          </button>
          <button type="button" className={styles.navItem} disabled>
            Catalog
          </button>
          <button type="button" className={styles.navItem} disabled>
            Settings
          </button>
        </nav>
        <p className={styles.sidebarFoot}>
          Shoppable video analytics for Shopify stores. Seeded with 14 days of UGC traffic.
        </p>
      </aside>

      <main className={styles.main}>
        <header className={styles.top}>
          <div>
            <p className={styles.eyebrow}>Analytics</p>
            <h1 className={styles.title}>Video performance</h1>
            <p className={styles.lede}>
              Views, product clicks, and add-to-carts across shoppable videos on the storefront.
              Conversion rate is add-to-carts divided by views.
            </p>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.simulate}
              onClick={simulateTraffic}
              disabled={simulating || loading}
            >
              {simulating ? 'Sending event…' : 'Simulate traffic'}
            </button>
            <span className={styles.simulateHint}>
              Posts a weighted random event to /api/events
            </span>
          </div>
        </header>

        {notice && !error ? <p className={styles.toast}>{notice}</p> : null}
        {error ? <p className={`${styles.toast} ${styles.toastError}`}>{error}</p> : null}

        <section className={styles.kpis} aria-label="Store totals">
          <Kpi label="Views" value={formatCount(summary.views)} />
          <Kpi label="Clicks" value={formatCount(summary.clicks)} />
          <Kpi label="Add to carts" value={formatCount(summary.conversions)} />
          <Kpi label="Store conversion" value={formatPercent(storeCvr)} />
        </section>

        <section className={styles.panel} aria-labelledby="table-heading">
          <div className={styles.panelHead}>
            <h2 id="table-heading" className={styles.panelTitle}>
              Videos
            </h2>
            <p className={styles.panelMeta}>
              {formatCount(summary.videos)} videos · sorted by {sortLabel(sortBy)}
            </p>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <SortHeader label="Video" column="title" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortHeader
                    label="Product"
                    column="productName"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortHeader label="Views" column="views" sortBy={sortBy} sortOrder={sortOrder} numeric onSort={handleSort} />
                  <SortHeader label="Clicks" column="clicks" sortBy={sortBy} sortOrder={sortOrder} numeric onSort={handleSort} />
                  <SortHeader
                    label="Add to carts"
                    column="conversions"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    numeric
                    onSort={handleSort}
                  />
                  <th className={styles.num} scope="col">
                    Conv. rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && videos.length === 0
                  ? skeletonRows()
                  : videos.map((video) => <VideoRow key={video.id} video={video} />)}
              </tbody>
            </table>
          </div>

          {!loading && videos.length === 0 ? (
            <p className={styles.status}>No videos yet. Seed the database and refresh.</p>
          ) : null}

          <div className={styles.pager}>
            <p className={styles.pagerStatus}>
              {from}–{to} of {formatCount(pagination.total)}
            </p>
            <div className={styles.pagerBtns}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={pagination.page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={styles.pageBtn}
                  data-active={item === pagination.page}
                  disabled={loading}
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              ))}
              <button
                type="button"
                className={styles.pageBtn}
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.kpi}>
      <p className={styles.kpiLabel}>{label}</p>
      <p className={styles.kpiValue}>{value}</p>
    </article>
  );
}

function VideoRow({ video }: { video: VideoAnalytics }) {
  const rate = conversionRate(video.conversions, video.views);
  const tone = rateTone(rate);
  const width = Math.min(100, Math.round((rate ?? 0) * 1000) / 8);

  return (
    <tr>
      <td>
        <p className={styles.videoTitle}>{video.title}</p>
      </td>
      <td>
        <p className={styles.videoTitle} style={{ fontWeight: 500 }}>
          {video.productName}
        </p>
        <p className={styles.videoProduct}>{formatPrice(video.productPrice)}</p>
      </td>
      <td className={styles.num}>{formatCount(video.views)}</td>
      <td className={styles.num}>{formatCount(video.clicks)}</td>
      <td className={styles.num}>{formatCount(video.conversions)}</td>
      <td className={styles.num}>
        <span className={`${styles.rate} ${styles[`tone-${tone}`]}`}>
          <span className={styles.bar} aria-hidden="true">
            <span className={`${styles.barFill} ${styles[`fill-${tone}`]}`} style={{ width: `${width}%` }} />
          </span>
          {formatPercent(rate)}
        </span>
      </td>
    </tr>
  );
}

function skeletonRows() {
  return Array.from({ length: 6 }, (_, index) => (
    <tr key={index}>
      {Array.from({ length: 6 }, (__, cell) => (
        <td key={cell}>
          <div className={styles.skel} style={{ width: cell === 0 ? '70%' : '40%', marginLeft: cell > 1 ? 'auto' : 0 }} />
        </td>
      ))}
    </tr>
  ));
}

function describeEvent(event: CreatedEvent, title: string): string {
  return `Recorded a ${eventLabel(event.eventType)} on “${title}”. Table refreshed.`;
}

function sortLabel(sortBy: SortBy): string {
  if (sortBy === 'productName') return 'product';
  if (sortBy === 'conversions') return 'add to carts';
  return sortBy;
}
