import { PlayFill } from './components/Icons';
import { ShopperJourney } from './components/Journey';
import { Mascot } from './components/Mascot';
import { ClipChart } from './components/ClipChart';
import { VideoTable } from './components/VideoTable';
import { useAnalytics } from './hooks/useAnalytics';
import styles from './App.module.css';
import { formatCount, formatPercent, oneInN } from './utils/metrics';

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
        <div className={styles.advertiser} title="Advertiser">
          <p className={styles.advertiserName}>Foxtale</p>
          <p className={styles.advertiserMeta}>Shopify · Beauty</p>
        </div>
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
          <section className={`${styles.card} ${styles.conversion}`} aria-label="Conversion">
            <div className={styles.heroHead}>
              <p className={styles.kicker}>Foxtale · Store conversion</p>
              <p className={styles.starLabel}>Top clip</p>
            </div>
            <div className={styles.hero}>
              <div className={styles.heroCopy}>
                <div>
                  <p className={styles.rate}>{formatPercent(storeCvr)}</p>
                  <p className={styles.rateHint}>{oneInN(storeCvr) ?? 'Add to carts ÷ views'}</p>
                  <p className={styles.heroCredit}>12% Niacinamide Clarifying Serum · ₹645</p>
                </div>
                <dl className={styles.stats}>
                  <div>
                    <dt className={styles.statLabel}>Views</dt>
                    <dd className={styles.statValue}>{formatCount(summary.views)}</dd>
                  </div>
                  <div>
                    <dt className={styles.statLabel}>Clicks</dt>
                    <dd className={styles.statValue}>{formatCount(summary.clicks)}</dd>
                  </div>
                  <div>
                    <dt className={styles.statLabel}>Add to carts</dt>
                    <dd className={styles.statValue}>{formatCount(summary.conversions)}</dd>
                  </div>
                </dl>
              </div>
              <figure className={styles.star}>
                <img
                  className={styles.starStill}
                  src="/foxtale-best-ad.jpg"
                  alt="Foxtale shoppable video: 12% Niacinamide Clarifying Serum"
                  width={466}
                  height={1024}
                />
              </figure>
            </div>
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
