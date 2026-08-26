import { PlayFill } from './components/Icons';
import { ShopperJourney } from './components/Journey';
import { Mascot } from './components/Mascot';
import { ClipChart } from './components/ClipChart';
import { VideoTable } from './components/VideoTable';
import { useAnalytics } from './hooks/useAnalytics';
import styles from './App.module.css';
import { conversionRate, formatCount, formatPercent, formatPrice, oneInN } from './utils/metrics';

export default function App() {
  const {
    videos,
    chartVideos,
    summary,
    pagination,
    setPage,
    sortBy,
    sortOrder,
    handleSort,
    loading,
    simulating,
    error,
    notice,
    flashId,
    lastEvent,
    mood,
    storeCvr,
    star,
    simulateTraffic,
  } = useAnalytics();

  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      <header className={styles.topbar}>
        <a href="/" aria-label="Videoselz home">
          <img
            className={styles.brandLogo}
            src="/videoselz-logo.svg"
            alt="Videoselz"
            width={99}
            height={26}
            decoding="async"
          />
        </a>
        <nav className={styles.nav} aria-label="Primary">
          <button type="button" className={styles.navItem} aria-current="page">
            Performance
          </button>
          <button type="button" className={styles.navItem} disabled>
            Catalog
          </button>
        </nav>
        <div className={styles.topActions}>
          <span className={styles.storeChip}>Last 14 days</span>
          <button
            type="button"
            className={styles.simulate}
            onClick={simulateTraffic}
            disabled={simulating || loading}
          >
            <PlayFill size={18} mark="#0b74d4" />
            {simulating ? 'Sending…' : 'Simulate traffic'}
          </button>
        </div>
      </header>

      <main id="main" className={styles.main}>
        <div className={styles.split}>
          <section className={styles.card} aria-label="Conversion">
            <p className={styles.kicker}>Store conversion</p>
            <p className={styles.rate}>{formatPercent(storeCvr)}</p>
            <p className={styles.rateHint}>{oneInN(storeCvr) ?? 'Add to carts ÷ views'}</p>
            <div className={styles.stats}>
              <div>
                <p className={styles.statLabel}>Views</p>
                <p className={styles.statValue}>{formatCount(summary.views)}</p>
              </div>
              <div>
                <p className={styles.statLabel}>Clicks</p>
                <p className={styles.statValue}>{formatCount(summary.clicks)}</p>
              </div>
              <div>
                <p className={styles.statLabel}>Add to carts</p>
                <p className={styles.statValue}>{formatCount(summary.conversions)}</p>
              </div>
            </div>
            {star ? (
              <div className={styles.star}>
                <span className={styles.starThumb} aria-hidden="true">
                  <PlayFill size={16} />
                </span>
                <div className={styles.starCopy}>
                  <p className={styles.starLabel}>Highest converting clip</p>
                  <p className={styles.starTitle}>{star.title}</p>
                  <p className={styles.starMeta}>
                    {star.productName} · {formatPrice(star.productPrice)}
                  </p>
                </div>
                <p className={styles.starRate}>{formatPercent(conversionRate(star.conversions, star.views))}</p>
              </div>
            ) : null}
          </section>

          <aside className={styles.card}>
            <ShopperJourney summary={summary} />
          </aside>
        </div>

        <ClipChart videos={chartVideos} highlightId={star?.id} />

        {notice && !error ? (
          <p className={styles.toast} role="status">
            {notice}
          </p>
        ) : null}
        {error ? (
          <p className={`${styles.toast} ${styles.toastError}`} role="alert">
            {error}
          </p>
        ) : null}

        <VideoTable
          videos={videos}
          pagination={pagination}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          flashId={flashId}
          clipCount={summary.videos}
          onSort={handleSort}
          onPage={setPage}
        />
      </main>

      <Mascot mood={mood} videos={chartVideos} lastEvent={lastEvent} />
    </div>
  );
}
