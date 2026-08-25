import { z } from 'zod';
import { EVENT_TYPES } from '../types';

export const createEventSchema = z.object({
  videoId: z.coerce.number().int().positive({
    message: 'videoId must be a positive integer',
  }),
  eventType: z.enum(EVENT_TYPES, {
    errorMap: () => ({
      message: `eventType must be one of: ${EVENT_TYPES.join(', ')}`,
    }),
  }),
  timestamp: z
    .string()
    .datetime({ message: 'timestamp must be an ISO-8601 datetime' })
    .optional(),
});

export const analyticsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(8),
  sortBy: z
    .enum(['title', 'views', 'clicks', 'conversions', 'productName'])
    .default('views'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
