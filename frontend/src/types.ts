export type EventType = 'view' | 'click' | 'add_to_cart';
export type SortBy = 'title' | 'views' | 'clicks' | 'conversions' | 'productName';
export type SortOrder = 'asc' | 'desc';

export interface VideoAnalytics {
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

export interface AnalyticsResponse {
  success: boolean;
  videos: VideoAnalytics[];
  pagination: PaginationMeta;
  summary: AnalyticsSummary;
}

export interface VideoOption {
  id: number;
  title: string;
}

export interface CreatedEvent {
  id: number;
  videoId: number;
  eventType: EventType;
  timestamp: string;
}
