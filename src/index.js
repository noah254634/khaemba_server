import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRouter        from './routes/auth.js';
import projectsRouter    from './routes/projects.js';
import contactRouter     from './routes/contact.js';
import githubRouter      from './routes/github.js';
import cvRouter          from './routes/cv.js';
import articlesRouter    from './routes/articles.js';
import technologiesRouter from './routes/technologies.js';
import messagesRouter    from './routes/messages.js';
import testimonialsRouter from './routes/testimonials.js';

// Ensure all Mongoose models are registered at startup
import './models/Tag.js';
import './models/Technology.js';
import './models/ProjectImage.js';
import './models/EngineeringDecision.js';
import './models/Testimonial.js';

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Startup guards ────────────────────────────────────────────────────────────
if (!process.env.MONGODB_URI) {
  console.error('❌  MONGODB_URI is missing. Copy server/.env.example to server/.env');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('❌  JWT_SECRET is missing. Add it to server/.env');
  process.exit(1);
}

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL  || 'http://localhost:5173',
    process.env.ADMIN_URL   || 'http://localhost:5174',
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logging ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toLocaleTimeString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const status = res.statusCode;

    // Method colors
    let methodColor = '\x1b[32m'; // GET: green
    if (method === 'POST') methodColor = '\x1b[33m'; // POST: yellow
    else if (method === 'PATCH' || method === 'PUT') methodColor = '\x1b[36m'; // PATCH/PUT: cyan
    else if (method === 'DELETE') methodColor = '\x1b[31m'; // DELETE: red

    // Status colors
    let statusColor = '\x1b[32m'; // 2xx: green
    if (status >= 500) statusColor = '\x1b[31m'; // 5xx: red
    else if (status >= 400) statusColor = '\x1b[33m'; // 4xx: yellow
    else if (status >= 300) statusColor = '\x1b[36m'; // 3xx: cyan

    console.log(
      `\x1b[90m[${timestamp}]\x1b[0m ${methodColor}${method.padEnd(6)}\x1b[0m \x1b[1m${originalUrl}\x1b[0m → ${statusColor}${status}\x1b[0m \x1b[90m(${duration}ms)\x1b[0m`
    );
  });

  next();
});

import profileRouter     from './routes/profile.js';

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRouter);
app.use('/api/profile',      profileRouter);
app.use('/api/projects',     projectsRouter);
app.use('/api/contact',      contactRouter);
app.use('/api/github',       githubRouter);
app.use('/api/cv',           cvRouter);
app.use('/api/articles',     articlesRouter);
app.use('/api/technologies', technologiesRouter);
app.use('/api/messages',     messagesRouter);
app.use('/api/testimonials', testimonialsRouter);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK', timestamp: new Date().toISOString() }),
);

// ── Error handlers ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error('\x1b[31m❌  [ERROR]\x1b[0m', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀  Server running on port ${PORT}`));
  })
  .catch((err) => { console.error('❌  MongoDB:', err.message); process.exit(1); });
