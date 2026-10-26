import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import { config } from './config/env';
import healthRoutes from './routes/health.routes';
import templateRoutes from './routes/template.routes';
import generationRoutes from './routes/generation.routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { apiRateLimiter } from './middleware/security.middleware';

// Ensure storage directories exist
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}
if (!fs.existsSync(config.generatedDir)) {
  fs.mkdirSync(config.generatedDir, { recursive: true });
}

export const createApp = (): Application => {
  const app = express();

  // 1. HTTP Security Headers with Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // Allows cross-origin image embedding in local frontend
    })
  );

  // 2. CORS Configuration
  const allowedOrigins = [
    config.frontendUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || config.nodeEnv === 'development') {
          return callback(null, true);
        }
        return callback(new Error('Blocked by CORS policy'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-admin-secret'],
    })
  );

  // 3. Global API Rate Limiter
  app.use('/api', apiRateLimiter);

  // 4. Body parsers with size limit
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 5. Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/templates', templateRoutes);
  app.use('/api/generations', generationRoutes);

  // 6. 404 Handler
  app.use(notFoundHandler);

  // 7. Centralized Error Handler
  app.use(errorHandler);

  return app;
};
