import { Router } from 'express';
import { getVideoAnalyticsHandler, getVideos, postEvent } from '../controllers/analyticsController';
import { validateBody, validateQuery } from '../middleware/errorHandler';
import { analyticsQuerySchema, createEventSchema } from '../validators/schemas';

export const apiRouter = Router();

apiRouter.post('/events', validateBody(createEventSchema), postEvent);
apiRouter.get('/analytics/videos', validateQuery(analyticsQuerySchema), getVideoAnalyticsHandler);
apiRouter.get('/videos', getVideos);
