import express, { Express, NextFunction, Request, Response } from 'express';
import { APP_CONFIG } from '../configuration/app.config';
import { v1Router } from './routes/v1.routes';

export function createBackendApp(): Express {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  // Mount v1 REST API routes
  app.use(APP_CONFIG.apiPrefix, v1Router);

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      success: true,
      service: APP_CONFIG.appName,
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // Centralized API 404 & Error Handler
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled API Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal Server Error',
    });
  });

  return app;
}
