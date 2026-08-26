import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAnalytics, fetchVideos, postEvent } from '../api/client';
import type { AnalyticsSummary, EventType, PaginationMeta, SortBy, SortOrder, VideoAnalytics, VideoOption } from '../types';
import { summaryConversion } from '../utils/metrics';
import { eventLabel, randomEventType, randomVideo } from '../utils/simulate';
import { starVideo } from '../utils/star';
import type { MascotMood } from '../components/Mascot';

export const PAGE_SIZE = 8;

const EMPTY_SUMMARY: AnalyticsSummary = { videos: 0, views: 0, clicks: 0, conversions: 0 };

/**
 * One hook owns dashboard data: table page, full clip list for the chart,
 * and simulate-traffic. Keeps App.tsx as layout, not a fetch orchestrator.
 */
export function useAnalytics() {
  const [videos, setVideos] = useState<VideoAnalytics[]>([]);
  const [chartVideos, setChartVideos] = useState<VideoAnalytics[]>([]);
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
  const [flashId, setFlashId] = useState<number | null>(null);
  const [lastEvent, setLastEvent] = useState<{ type: EventType; title: string } | null>(null);
  const [mood, setMood] = useState<MascotMood>('idle');

  const loadTable = useCallback(
    async (signal?: { cancelled: boolean }) => {
      const data = await fetchAnalytics({ page, limit: PAGE_SIZE, sortBy, sortOrder });
      if (signal?.cancelled) return;
      setVideos(data.videos);
      setPagination(data.pagination);
      setSummary(data.summary);
    },
    [page, sortBy, sortOrder]
  );

  const loadCharts = useCallback(async (signal?: { cancelled: boolean }) => {
    const data = await fetchAnalytics({
      page: 1,
      limit: 50,
      sortBy: 'conversions',
      sortOrder: 'desc',
    });
    if (signal?.cancelled) return;
    setChartVideos(data.videos);
    setSummary(data.summary);
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    (async () => {
      setLoading(true);
      try {
        await loadTable(signal);
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
  }, [loadTable]);

  useEffect(() => {
    const signal = { cancelled: false };
    loadCharts(signal).catch(() => undefined);
    fetchVideos()
      .then((data) => setCatalog(data.videos))
      .catch(() => undefined);
    return () => {
      signal.cancelled = true;
    };
  }, [loadCharts]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (mood !== 'celebrate' && mood !== 'watching') return undefined;
    const timer = window.setTimeout(() => setMood('idle'), 4200);
    return () => window.clearTimeout(timer);
  }, [mood]);

  const storeCvr = useMemo(() => summaryConversion(summary), [summary]);
  const star = useMemo(() => starVideo(chartVideos), [chartVideos]);

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
    setMood('watching');
    setError(null);

    try {
      const { event } = await postEvent({ videoId: video.id, eventType });
      setNotice(`A ${eventLabel(event.eventType)} on “${video.title}”.`);
      setLastEvent({ type: event.eventType, title: video.title });
      setFlashId(video.id);
      setMood('celebrate');
      await Promise.all([loadTable(), loadCharts()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ingest event');
      setMood('idle');
    } finally {
      setSimulating(false);
    }
  }

  return {
    videos,
    chartVideos,
    summary,
    pagination,
    page,
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
  };
}
