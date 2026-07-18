import { Router } from 'express';

const router = Router();

// Example API endpoint — replace with your application routes
router.get('/status', (_req, res) => {
  res.json({
    service: 'react-express-ecs API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
  });
});

export { router as apiRouter };
