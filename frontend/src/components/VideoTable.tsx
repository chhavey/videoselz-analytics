import { ChevronDown, ChevronUp, PlayFill } from './Icons';
import styles from './VideoTable.module.css';
import type { PaginationMeta, SortBy, SortOrder, VideoAnalytics } from '../types';
import { conversionRate, formatCount, formatPercent, formatPrice, rateTone } from '../utils/metrics';

interface Props {
  videos: VideoAnalytics[];
  pagination: PaginationMeta;
  loading: boolean;
  sortBy: SortBy;
  sortOrder: SortOrder;
  flashId: number | null;
  clipCount: number;
  onSort: (column: SortBy) => void;
  onPage: (page: number) => void;
}

export function VideoTable({
  videos,
  pagination,
  loading,
  sortBy,
  sortOrder,
  flashId,
  clipCount,
  onSort,
  onPage,
}: Props) {
  const from = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const to = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <section className={styles.panel} aria-labelledby="table-heading">
      <div className={styles.panelHead}>
        <h2 id="table-heading" className={styles.panelTitle}>
          Videos
        </h2>
        <p className={styles.panelMeta}>{formatCount(clipCount)} clips</p>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <SortHeader label="Video" column="title" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              <SortHeader
                label="Product"
                column="productName"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <SortHeader label="Views" column="views" sortBy={sortBy} sortOrder={sortOrder} numeric onSort={onSort} />
              <SortHeader label="Clicks" column="clicks" sortBy={sortBy} sortOrder={sortOrder} numeric onSort={onSort} />
              <SortHeader
                label="Add to carts"
                column="conversions"
                sortBy={sortBy}
                sortOrder={sortOrder}
                numeric
                onSort={onSort}
              />
              <th className={styles.num} scope="col">
                Conv. rate
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && videos.length === 0
              ? skeletonRows()
              : videos.map((video) => <VideoRow key={video.id} video={video} flash={flashId === video.id} />)}
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
            onClick={() => onPage(Math.max(1, pagination.page - 1))}
          >
            Previous
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((item) => (
            <button
              key={item}
              type="button"
              className={styles.pageBtn}
              data-active={item === pagination.page}
              disabled={loading}
              onClick={() => onPage(item)}
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            className={styles.pageBtn}
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => onPage(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
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
        data-active={active}
        onClick={() => onSort(column)}
        aria-label={`Sort by ${label}`}
      >
        {label}
        {active && sortOrder === 'asc' ? <ChevronUp /> : <ChevronDown />}
      </button>
    </th>
  );
}

function VideoRow({ video, flash }: { video: VideoAnalytics; flash: boolean }) {
  const rate = conversionRate(video.conversions, video.views);
  const tone = rateTone(rate);
  return (
    <tr data-flash={flash}>
      <td>
        <div className={styles.videoCell}>
          <span className={styles.thumb} aria-hidden="true">
            <PlayFill size={16} />
          </span>
          <p className={styles.videoTitle}>{video.title}</p>
        </div>
      </td>
      <td>
        <p className={styles.videoTitle}>{video.productName}</p>
        <p className={styles.price}>{formatPrice(video.productPrice)}</p>
      </td>
      <td className={styles.num}>{formatCount(video.views)}</td>
      <td className={styles.num}>{formatCount(video.clicks)}</td>
      <td className={styles.num}>{formatCount(video.conversions)}</td>
      <td className={`${styles.num} ${styles.cvr} ${styles[`tone-${tone}`]}`}>{formatPercent(rate)}</td>
    </tr>
  );
}

function skeletonRows() {
  return Array.from({ length: 5 }, (_, index) => (
    <tr key={index}>
      {Array.from({ length: 6 }, (__, cell) => (
        <td key={cell}>
          <div className={styles.skel} style={{ width: cell === 0 ? '60%' : '40%', marginLeft: cell > 1 ? 'auto' : 0 }} />
        </td>
      ))}
    </tr>
  ));
}
