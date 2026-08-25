import type { EventType, VideoOption } from '../types';

const EVENT_WEIGHTS: Array<{ type: EventType; weight: number }> = [
  { type: 'view', weight: 0.7 },
  { type: 'click', weight: 0.22 },
  { type: 'add_to_cart', weight: 0.08 },
];

export function randomEventType(): EventType {
  const roll = Math.random();
  let cursor = 0;
  for (const item of EVENT_WEIGHTS) {
    cursor += item.weight;
    if (roll < cursor) return item.type;
  }
  return 'view';
}

export function randomVideo(videos: VideoOption[]): VideoOption {
  return videos[Math.floor(Math.random() * videos.length)];
}

export function eventLabel(type: EventType): string {
  if (type === 'add_to_cart') return 'add to cart';
  return type;
}
