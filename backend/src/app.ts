import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api';
import { errorHandler } from './middleware/errorHandler';
import { migrate } from './db/migrate';
import { seed } from './db/seed';

dotenv.config();

migrate();
seed();

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: corsOrigin.split(',').map((origin) => origin.trim()),
  })
);
app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    service: 'videoselz-analytics-api',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiRouter);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
});

app.use(errorHandler);

export default app;
