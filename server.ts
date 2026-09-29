import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createBackendApp } from './backend/app';
import { APP_CONFIG } from './configuration/app.config';

async function bootstrapServer() {
  const app = createBackendApp();
  const port = Number(process.env.PORT) || APP_CONFIG.port || 3000;

  if (process.env.NODE_ENV !== 'production') {
    // Standard Vite Dev Server Middleware Configuration
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[${APP_CONFIG.appName || 'Feastify'}] Full-Stack Server listening on http://localhost:${port}`);
  });
}

bootstrapServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});