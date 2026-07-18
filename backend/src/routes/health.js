import { Router } from 'express';
import { getDbClient } from '../db/client.js';

const router = Router();

router.get('/', async (_req, res) => {
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'unknown',
    },
  };

  try {
    const client = await getDbClient();
    await client.query('SELECT 1');
    client.release();
    status.checks.database = 'ok';
    return res.status(200).json(status);
  } catch (err) {
    status.status = 'degraded';
    status.checks.database = `error: ${err.message}`;
    return res.status(503).json(status);
  }
});

export { router as healthRouter };
