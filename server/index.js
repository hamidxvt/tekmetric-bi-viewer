require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { initDB } = require('./db');
const { requireAuth } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Protect both SSO callback paths from abuse
const ssoLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: { error: 'Too many authentication attempts. Please wait and try again.' },
});
app.use('/api/auth/ai-center',    ssoLimiter);
app.use('/api/auth/sso-callback', ssoLimiter);

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // needed for form-POST from AI Center

app.use(cookieParser());

const allowedOrigins = [
  `http://localhost:${PORT}`,
  'http://localhost:5173',          // Vite dev server
  process.env.FRONTEND_ORIGIN,
  process.env.AI_CENTER_URL,        // AI Center frontend (for AJAX callbacks)
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ─── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/admin', adminRoutes);

// ─── Admin panel static assets (public — hashed filenames, safe to cache) ──────
const adminDist = path.join(__dirname, '..', 'admin', 'dist');
app.use('/admin/assets', express.static(path.join(adminDist, 'assets')));

// Admin SPA entry (auth required — React app also checks role internally)
app.get('/admin',   requireAuth, (req, res) => res.sendFile(path.join(adminDist, 'index.html')));
app.get('/admin/*', requireAuth, (req, res) => res.sendFile(path.join(adminDist, 'index.html')));

// ─── CSS: needed by the error / loading pages served by auth routes ────────────
app.use('/css', express.static(path.join(__dirname, '..', 'css')));

// ─── Protected: Explorer JS ────────────────────────────────────────────────────
app.use('/js', requireAuth, express.static(path.join(__dirname, '..', 'js')));

// ─── Protected: Main explorer ──────────────────────────────────────────────────
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ─── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).send('Not found'));

// ─── Boot ──────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running → http://localhost:${PORT}`);
      console.log(`   📊 Explorer → http://localhost:${PORT}/`);
      console.log(`   ⚙️  Admin   → http://localhost:${PORT}/admin`);
      console.log(`   🔐 SSO CB  → http://localhost:${PORT}/api/auth/sso-callback`);
      if (isDev) console.log(`   🛠  Admin Dev → http://localhost:5173/admin (Vite)\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  }
}

start();
