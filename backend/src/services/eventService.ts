import { db } from '../db/connection';
import { HttpError } from '../middleware/errorHandler';
import type { CreateEventInput } from '../validators/schemas';
import type { EventType } from '../types';

interface VideoExistsRow {
  id: number;
}

interface InsertedEventRow {
  id: number;
  video_id: number;
  event_type: EventType;
  timestamp: string;
}

export function createEngagementEvent(input: CreateEventInput) {
  const video = db
    .prepare('SELECT id FROM videos WHERE id = ?')
    .get(input.videoId) as VideoExistsRow | undefined;

  if (!video) {
    throw new HttpError(404, 'VIDEO_NOT_FOUND', `No video exists with id ${input.videoId}`);
  }

  const timestamp = input.timestamp
    ? new Date(input.timestamp).toISOString().replace('T', ' ').slice(0, 19)
    : new Date().toISOString().replace('T', ' ').slice(0, 19);

  const result = db
    .prepare(
      `INSERT INTO engagement_events (video_id, event_type, timestamp)
       VALUES (?, ?, ?)`
    )
    .run(input.videoId, input.eventType, timestamp);

  const event = db
    .prepare(
      `SELECT id, video_id, event_type, timestamp
       FROM engagement_events
       WHERE id = ?`
    )
    .get(result.lastInsertRowid) as InsertedEventRow;

  return {
    id: event.id,
    videoId: event.video_id,
    eventType: event.event_type,
    timestamp: event.timestamp,
  };
}
