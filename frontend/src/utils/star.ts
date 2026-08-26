import type { VideoAnalytics } from '../types';
import { conversionRate } from '../utils/metrics';

export function starVideo(videos: VideoAnalytics[]): VideoAnalytics | null {
  const ranked = videos
    .filter((video) => video.views >= 40)
    .sort((a, b) => {
      const rateA = conversionRate(a.conversions, a.views) ?? 0;
      const rateB = conversionRate(b.conversions, b.views) ?? 0;
      if (rateB !== rateA) return rateB - rateA;
      return b.conversions - a.conversions;
    });
  return ranked[0] ?? videos[0] ?? null;
}
