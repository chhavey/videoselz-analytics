import { db } from '../db/connection';
import type { AnalyticsQuery } from '../validators/schemas';
import type { AnalyticsSummary, PaginationMeta, VideoAnalyticsRow } from '../types';

const SORT_COLUMNS: Record<AnalyticsQuery['sortBy'], string> = {
  title: 'v.title',
  productName: 'p.name',
  views: 'views',
  clicks: 'clicks',
  conversions: 'conversions',
};

interface CountRow {
  total: number;
}

interface SummaryRow {
  videos: number;
  views: number;
  clicks: number;
  conversions: number;
}

interface RawAnalyticsRow {
  id: number;
  title: string;
  video_url: string;
  product_id: number;
  product_name: string;
  product_price: number;
  views: number;
  clicks: number;
  conversions: number;
}

export function getVideoAnalytics(query: AnalyticsQuery): {
  videos: VideoAnalyticsRow[];
  pagination: PaginationMeta;
  summary: AnalyticsSummary;
} {
  const sortColumn = SORT_COLUMNS[query.sortBy];
  const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (query.page - 1) * query.limit;

  const totalRow = db
    .prepare('SELECT COUNT(*) AS total FROM videos')
    .get() as CountRow;

  // Aggregate in SQL so the API stays O(videos) rather than O(events) in Node.
  const rows = db
    .prepare(
      `
      SELECT
        v.id,
        v.title,
        v.video_url,
        p.id AS product_id,
        p.name AS product_name,
        p.price AS product_price,
        COALESCE(SUM(CASE WHEN e.event_type = 'view' THEN 1 ELSE 0 END), 0) AS views,
        COALESCE(SUM(CASE WHEN e.event_type = 'click' THEN 1 ELSE 0 END), 0) AS clicks,
        COALESCE(SUM(CASE WHEN e.event_type = 'add_to_cart' THEN 1 ELSE 0 END), 0) AS conversions
      FROM videos v
      INNER JOIN products p ON p.id = v.product_id
      LEFT JOIN engagement_events e ON e.video_id = v.id
      GROUP BY v.id
      ORDER BY ${sortColumn} ${sortOrder}, v.id ASC
      LIMIT ? OFFSET ?
    `
    )
    .all(query.limit, offset) as RawAnalyticsRow[];

  const summary = db
    .prepare(
      `
      SELECT
        (SELECT COUNT(*) FROM videos) AS videos,
        COALESCE(SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END), 0) AS views,
        COALESCE(SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END), 0) AS clicks,
        COALESCE(SUM(CASE WHEN event_type = 'add_to_cart' THEN 1 ELSE 0 END), 0) AS conversions
      FROM engagement_events
    `
    )
    .get() as SummaryRow;

  const videos: VideoAnalyticsRow[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    videoUrl: row.video_url,
    productId: row.product_id,
    productName: row.product_name,
    productPrice: row.product_price,
    views: Number(row.views),
    clicks: Number(row.clicks),
    conversions: Number(row.conversions),
  }));

  return {
    videos,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: totalRow.total,
      totalPages: Math.max(1, Math.ceil(totalRow.total / query.limit)),
    },
    summary: {
      videos: Number(summary.videos),
      views: Number(summary.views),
      clicks: Number(summary.clicks),
      conversions: Number(summary.conversions),
    },
  };
}

export function listVideos(): Array<{ id: number; title: string }> {
  return db
    .prepare('SELECT id, title FROM videos ORDER BY id ASC')
    .all() as Array<{ id: number; title: string }>;
}
