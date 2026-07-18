import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { healthRouter } from './routes/health.js';
import { apiRouter } from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Security & compression
app.use(helmet());
app.use(compression());

// CORS — allow CloudFront origin in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['*'];

app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Logging & body parsing
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRouter);
app.use('/api', apiRouter);

// 404 & error handlers
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
