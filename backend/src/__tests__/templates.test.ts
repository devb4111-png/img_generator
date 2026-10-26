import request from 'supertest';
import sharp from 'sharp';
import { createApp } from '../app';

describe('Templates & Template Generation API', () => {
  const app = createApp();
  let validLogoBuffer: Buffer;

  beforeAll(async () => {
    // Generate valid 100x100 PNG logo buffer with Sharp
    validLogoBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 16, g: 185, b: 129, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
  });

  describe('GET /api/templates', () => {
    it('should list all active branded templates with placements', async () => {
      const res = await request(app).get('/api/templates');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const first = res.body.data[0];
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('width');
      expect(first).toHaveProperty('height');
      expect(first).toHaveProperty('placements');
      expect(first.placements).toHaveProperty('logo');
      expect(first.placements).toHaveProperty('organizationName');
    });

    it('should retrieve a single template by ID', async () => {
      const res = await request(app).get('/api/templates/tpl-corp-horizon');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('name', 'Corporate Horizon');
    });

    it('should return 404 for non-existent template ID', async () => {
      const res = await request(app).get('/api/templates/non-existent-template-id');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/generations/template', () => {
    it('should successfully composite logo and organization text onto a template', async () => {
      const res = await request(app)
        .post('/api/generations/template')
        .field('templateId', 'tpl-corp-horizon')
        .field('organizationName', 'Acme Global Ventures')
        .attach('logo', validLogoBuffer, 'logo.png');

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('previewUrl');
      expect(res.body.data).toHaveProperty('downloadUrl');
      expect(res.body.data).toHaveProperty('organizationName', 'Acme Global Ventures');
    });

    it('should reject generation when logo file is missing', async () => {
      const res = await request(app)
        .post('/api/generations/template')
        .field('templateId', 'tpl-corp-horizon')
        .field('organizationName', 'Acme Global Ventures');

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/logo/i);
    });

    it('should reject generation when organization name is empty', async () => {
      const res = await request(app)
        .post('/api/generations/template')
        .field('templateId', 'tpl-corp-horizon')
        .field('organizationName', '')
        .attach('logo', validLogoBuffer, 'logo.png');

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/organization/i);
    });
  });
});
