import { Request, Response, NextFunction } from 'express';
import { createEngagementEvent } from '../services/eventService';
import { getVideoAnalytics, listVideos } from '../services/analyticsService';
import type { AnalyticsQuery, CreateEventInput } from '../validators/schemas';

export function postEvent(req: Request, res: Response, next: NextFunction): void {
  try {
    const event = createEngagementEvent(req.body as CreateEventInput);
    res.status(201).json({ success: true, event });
  } catch (err) {
    next(err);
  }
}

export function getVideoAnalyticsHandler(req: Request, res: Response, next: NextFunction): void {
  try {
    const result = getVideoAnalytics(req.query as unknown as AnalyticsQuery);
    res.json({
      success: true,
      videos: result.videos,
      pagination: result.pagination,
      summary: result.summary,
    });
  } catch (err) {
    next(err);
  }
}

export function getVideos(req: Request, res: Response, next: NextFunction): void {
  try {
    res.json({ success: true, videos: listVideos() });
  } catch (err) {
    next(err);
  }
}
