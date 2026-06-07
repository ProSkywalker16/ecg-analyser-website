import express from 'express';
import https from 'https';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import fileRoutes from './routes/files.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
if (supabaseKey === process.env.SUPABASE_KEY) {
  console.log('[INFO] Using anon key — if table access fails, set SUPABASE_SERVICE_KEY in .env');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  supabaseKey,
  {
    realtime: {
      transport: WebSocket,
    },
  }
);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://*.supabase.co", "https://ngezqjpitfvafgkiszat.supabase.co"],
      connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: isDev ? 'cross-origin' : 'same-origin' },
}));

// CORS - allow only known origins
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:4173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parser with size limit
app.use(express.json({ limit: '50kb' }));

// Health check — must be before rate limiter so Render's pings don't get 429'd
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/', apiLimiter);

// Trust proxy — needed for real client IP behind Cloudflare / hosting load balancers
app.set('trust proxy', true);

// Global error sanitization
function sanitizeError(err) {
  if (process.env.NODE_ENV === 'production') {
    return 'Internal server error';
  }
  return err.message || 'Internal server error';
}

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);

// Serve built client in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const clientDist = join(__dirname, '..', 'client', 'dist');

if (!isDev) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(join(clientDist, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack || err.message || err);
  res.status(err.status || 500).json({ error: sanitizeError(err) });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  // startKeepAlive();
});
/* I deactivated this function to prevent free tier runout but it actually works
// ─── Keep-Alive Self-Ping ────────────────────────────────────────────────────
// Render's free tier spins down after 15 min of inactivity.
// This pings /api/health every 12 minutes to keep the instance warm.
function startKeepAlive() {
  // RENDER_EXTERNAL_URL is automatically set by Render in production.
  // Falls back to SERVER_URL in .env for other platforms.
  const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;

  if (!baseUrl) {
    console.log('[keep-alive] No RENDER_EXTERNAL_URL or SERVER_URL set — skipping self-ping (dev mode).');
    return;
  }

  const pingUrl = `${baseUrl.replace(/\/$/, '')}/api/health`;
  const interval = 12 * 60 * 1000; // 12 minutes in ms

  const ping = () => {
    const client = pingUrl.startsWith('https') ? https : http;
    const req = client.get(pingUrl, (res) => {
      console.log(`[keep-alive] Pinged ${pingUrl} → HTTP ${res.statusCode}`);
    });
    req.on('error', (err) => {
      console.warn(`[keep-alive] Ping failed: ${err.message}`);
    });
    req.end();
  };

  // First ping after 12 minutes, then repeat
  setInterval(ping, interval);
  console.log(`[keep-alive] Self-ping scheduled every 12 min → ${pingUrl}`);
}
*/