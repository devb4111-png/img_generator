import request from 'supertest';
import { createApp } from '../app';

describe('Health Check API (GET /api/health)', () => {
  const app = createApp();

  it('should return HTTP 200 with ok status and service metadata', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'Team Connect Image Generator Backend');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('storage');
    expect(res.body.storage).toHaveProperty('uploadsReady', true);
    expect(res.body.storage).toHaveProperty('generatedReady', true);
  });

  it('should return security headers added by Helmet', async () => {
    const res = await request(app).get('/api/health');

    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(res.headers).toHaveProperty('cross-origin-resource-policy', 'cross-origin');
  });
});
