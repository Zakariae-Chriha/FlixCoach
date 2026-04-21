require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// ─── SECURITY HEADERS ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Managed by Vite/frontend
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── COMPRESSION (gzip) ──────────────────────────────────────────────────────
app.use(compression({ level: 6, threshold: 1024 }));

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
const makeLimit = (max, windowMin = 15) =>
  rateLimit({
    windowMs: windowMin * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Zu viele Anfragen – bitte warten Sie und versuchen Sie es erneut.' },
  });

// Auth: strict (10 per 15 min) – prevents brute-force
app.use('/api/auth/login', makeLimit(10));
app.use('/api/auth/register', makeLimit(5));
app.use('/api/auth/change-password', makeLimit(5));

// AI routes: 30 per 15 min (expensive compute)
app.use('/api/coach/chat', makeLimit(30));
app.use('/api/training/generate', makeLimit(5));
app.use('/api/nutrition/generate', makeLimit(5));

// Video: 20 per 15 min
app.use('/api/video', makeLimit(20));

// General: 200 per 15 min
app.use('/api/', makeLimit(200));

// ─── BODY PARSING ─────────────────────────────────────────────────────────────
// Stripe webhook needs raw body — register BEFORE json middleware
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ─── NOSQL INJECTION PREVENTION ──────────────────────────────────────────────
app.use(mongoSanitize({ replaceWith: '_' }));

// ─── XSS / INPUT SANITIZATION ────────────────────────────────────────────────
app.use((req, _res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };
  sanitize(req.body);
  next();
});

// ─── STATIC FILES ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true,
}));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/profile',        require('./routes/profile'));
app.use('/api/coach',          require('./routes/coach'));
app.use('/api/training',       require('./routes/training'));
app.use('/api/nutrition',      require('./routes/nutrition'));
app.use('/api/logs',           require('./routes/logs'));
app.use('/api/reports',        require('./routes/reports'));
app.use('/api/progress',       require('./routes/progress'));
app.use('/api/checklist',      require('./routes/checklist'));
app.use('/api/coaches',        require('./routes/coaches'));
app.use('/api/coach-dashboard',require('./routes/coachDashboard'));
app.use('/api/community',      require('./routes/community'));
app.use('/api/activities',     require('./routes/groupActivities'));
app.use('/api/stripe',         require('./routes/stripe'));
app.use('/api/notifications',  require('./routes/notifications'));
app.use('/api/video',          require('./routes/video'));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({
  status: 'OK',
  timestamp: new Date(),
  uptime: Math.floor(process.uptime()),
  memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
}));

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use('/api/*', (_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  // Don't leak stack traces in production
  const isDev = process.env.NODE_ENV !== 'production';
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  if (isDev) console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack }),
  });
});

// ─── MONGODB + SERVER START ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5002;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/persona-ai-trainer', {
  family: 4,
  maxPoolSize: 10,        // Up to 10 concurrent connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB connected (pool: 10)');
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔒 Security: Helmet + Rate Limiting + Mongo Sanitize + gzip`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received — shutting down gracefully');
    server.close(() => mongoose.connection.close(() => process.exit(0)));
  });
  process.on('SIGINT', () => {
    server.close(() => mongoose.connection.close(() => process.exit(0)));
  });

  require('./jobs/weeklyReportJob').startWeeklyReportJob();
  require('./jobs/notificationJob').startNotificationJobs();
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});
