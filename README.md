# ECG Analyser — Web App

Web-based patient dashboard for viewing ECG session history, processed signals, and AI diagnostic results.

## Architecture

```
ecg-analyser-web/
├── client/        React 18 + Vite + TailwindCSS (port 5173)
├── server/        Express.js API + Supabase SDK (port 3001)
└── package.json   Root orchestrator (dev scripts, concurrently)
```

The Vite dev server proxies `/api` requests to the Express backend.

## Features

- **JWT-based auth** with dual credentials (password + secret passcode)
- **Dashboard** — patient profile, session list, ECG viewer
- **ECG Viewer** — Canvas-rendered signal plots with raw / processed / normalized views, zoom, pan, R-peak markers
- **Server-side DSP** — baseline wander removal, low-pass filter, notch filter, resampling, R-peak detection
- **AI prediction display** — class label, confidence, severity, clinical guidance
- **Theme toggle** — light / dark mode with CSS variables
- **Inactivity timeout** — auto-logout after 4 minutes with warning prompt
- **Security hardened** — Helmet CSP headers, rate limiting, SSRF protection, no error leaking

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Vite 5, TailwindCSS 3, Recharts |
| Backend | Express 4.21 (ESM), jsonwebtoken, bcryptjs |
| Database | Supabase PostgreSQL (via `@supabase/supabase-js`) |
| Storage | Supabase Storage (CSV / PDF) |
| Security | Helmet, express-rate-limit, bcrypt (cost 12), JWT |
| DSP | Custom pure-JS signal processing pipeline |

## Setup

### Prerequisites

- Node.js 18+
- Supabase project

### 1. Environment Variables

```bash
cp ecg-analyser-web/server/.env.example ecg-analyser-web/server/.env
```

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_KEY` | Service role key (recommended over anon for backend) |
| `JWT_SECRET` | Strong random secret — generate with `node -e "require('crypto').randomBytes(48).toString('hex')"` |
| `PORT` | Server port (default 3001) |
| `CORS_ORIGINS` | Comma-separated allowed origins |

### 2. Run Database Migrations

Open `ecg-analyser-web/server/setup.sql` in your Supabase SQL Editor and execute it. This enables RLS and creates secure RPC functions.

### 3. Install

```bash
cd ecg-analyser-web
npm run install:all    # installs server/ + client/ dependencies
```

### 4. Development

```bash
cd ecg-analyser-web
npm run dev            # starts both Express (port 3001) and Vite (port 5173)
```

### 5. Production

```bash
cd ecg-analyser-web
npm run build          # builds client/ into client/dist/
npm start              # serves API + built client from server/
```

## Security

- **RLS**: Supabase policies deny all direct anon table access. All operations go through the authenticated Express backend.
- **JWT**: Signed with a strong secret (server refuses to start without it). 24h expiry.
- **Rate limiting**: 10 req/15min on auth routes, 120 req/15min on all other routes.
- **CSP**: Content Security Policy via Helmet restricts scripts, styles, framing, and connection targets.
- **SSRF**: CSV fetch URLs are validated against an allowlist of Supabase storage hosts.
- **Error handling**: Internal details never reach the client in production mode.
- **Body limits**: JSON payloads capped at 50 KB.

## Folder Structure

```
ecg-analyser-web/
├── package.json          # Root orchestrator
├── dev.js                # Concurrent dev runner
├── client/
│   ├── src/
│   │   ├── contexts/     # AuthContext, ThemeContext
│   │   ├── services/api.js
│   │   ├── pages/        # Landing, Login, Register, Dashboard
│   │   └── components/   # Navbar, Footer, Auth forms, Dashboard widgets
│   ├── public/images/    # Team photos
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── server/
    ├── index.js          # App entry + Supabase client
    ├── dsp.js            # Signal processing pipeline
    ├── middleware/auth.js # JWT verification
    ├── routes/           # auth.js, patients.js, files.js
    ├── setup.sql         # Supabase RLS + RPC functions
    └── .env.example
```

## Deployment (Render)

A `render.yaml` is provided at the repo root. To deploy:

1. Push the repo to GitHub
2. In Render dashboard, select **Blueprint** and connect your repo
3. Set environment variables in Render:

   | Variable | How to get it |
   |---|---|
   | `SUPABASE_URL` | Supabase Dashboard > Project Settings > API |
   | `SUPABASE_KEY` | Supabase Dashboard > Project Settings > API > anon key |
   | `SUPABASE_SERVICE_KEY` | Supabase Dashboard > Project Settings > API > service_role key |
   | `JWT_SECRET` | Leave blank — Render will auto-generate one |
   | `CORS_ORIGINS` | Set to `https://your-app-name.onrender.com` |

4. Render auto-detects build and start commands from `render.yaml`

The server serves the built React app from `client/dist/` in production at the same domain — no separate frontend hosting needed.
