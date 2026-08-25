export const EVENT_TYPES = ['view', 'click', 'add_to_cart'] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export interface ProductRow {
  id: number;
  name: string;
  price: number;
  created_at: string;
}

export interface VideoRow {
  id: number;
  product_id: number;
  video_url: string;
  title: string;
}

export interface EngagementEventRow {
  id: number;
  video_id: number;
  event_type: EventType;
  timestamp: string;
}

export interface VideoAnalyticsRow {
  id: number;
  title: string;
  videoUrl: string;
  productId: number;
  productName: string;
  productPrice: number;
  views: number;
  clicks: number;
  conversions: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AnalyticsSummary {
  videos: number;
  views: number;
  clicks: number;
  conversions: number;
}
