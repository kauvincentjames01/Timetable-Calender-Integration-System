import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

import calendarRoutes from './routes/calendarRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { getDb } from './database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
         return res.json({ status: 'warn', message: 'No valid database connection. Check your DATABASE_URL environment variable.', postgres: false });
      }
      // Test actual connection
      await db.query('SELECT 1');
      res.json({ status: 'ok', message: 'Connected to PostgreSQL database successfully!', postgres: true });
    } catch (e) {
      res.status(500).json({ status: 'error', message: 'Database connection failed', error: e.message, postgres: false });
    }
  });

  // API Routes FIRST so Vite doesn't intercept them
  app.use('/api', calendarRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);

  // Global Error Handler for APIs
  app.use(errorHandler);

  // Vite middleware for frontend development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to 0.0.0.0
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`System Integration Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
