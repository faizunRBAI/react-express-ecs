import request from 'supertest';
import { jest } from '@jest/globals';

// Mock db client before importing app
jest.unstable_mockModule('../db/client.js', () => ({
  getDbClient: jest.fn().mockResolvedValue({
    query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
    release: jest.fn(),
  }),
}));

const { default: app } = await import('../index.js');

describe('GET /health', () => {
  it('returns 200 with status ok when db is healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.checks.database).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });
});

describe('GET /api/status', () => {
  it('returns service status', async () => {
    const res = await request(app).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('react-express-ecs API');
  });
});

describe('GET /unknown-route', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});
