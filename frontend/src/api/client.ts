import type {
  AnalyticsResponse,
  CreatedEvent,
  EventType,
  SortBy,
  SortOrder,
  VideoOption,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = (await response.json()) as T & {
    success?: boolean;
    error?: { message: string };
  };

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error?.message || `Request failed (${response.status})`);
  }

  return payload;
}

export function fetchAnalytics(params: {
  page: number;
  limit: number;
  sortBy: SortBy;
  sortOrder: SortOrder;
}): Promise<AnalyticsResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  return request<AnalyticsResponse>(`/api/analytics/videos?${query.toString()}`);
}

export function fetchVideos(): Promise<{ success: boolean; videos: VideoOption[] }> {
  return request('/api/videos');
}

export function postEvent(body: {
  videoId: number;
  eventType: EventType;
}): Promise<{ success: boolean; event: CreatedEvent }> {
  return request('/api/events', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
