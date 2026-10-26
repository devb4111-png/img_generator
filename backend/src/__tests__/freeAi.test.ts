import request from 'supertest';
import sharp from 'sharp';
import { createApp } from '../app';
import { promptBuilder } from '../services/promptBuilder.service';
import { freeDiffusionService } from '../services/freeDiffusion.service';

describe('Free AI Generation & Prompt Builder Tests', () => {
  const app = createApp();
  let validLogoBuffer: Buffer;

  beforeAll(async () => {
    validLogoBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 99, g: 102, b: 241, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
  });

  describe('PromptBuilder Validation', () => {
    it('should reject creative ideas under 5 characters', () => {
      expect(() => promptBuilder.validateIdea('abc')).toThrow('at least 5 characters');
    });

    it('should validate and clean valid creative concepts', () => {
      const cleaned = promptBuilder.validateIdea('  Futuristic bio-tech laboratory with neon glass  ');
      expect(cleaned).toBe('Futuristic bio-tech laboratory with neon glass');
    });

    it('should build structured prompt containing strict negative space instructions', () => {
      const promptData = promptBuilder.buildPrompt({
        creativeIdea: 'Solar energy park at sunset',
        style: 'vivid',
        brandingZone: 'bottom',
      });

      expect(promptData.structuredPrompt).toContain('Solar energy park at sunset');
      expect(promptData.structuredPrompt).toContain('NO text, NO typography');
      expect(promptData.brandingZone).toBe('bottom');
    });
  });

  describe('FreeDiffusionService Dimensions Parsing', () => {
    it('should correctly parse 1024x1024 dimensions', () => {
      const dims = freeDiffusionService.parseDimensions('1024x1024');
      expect(dims).toEqual({ width: 1024, height: 1024 });
    });

    it('should correctly parse 1792x1024 landscape dimensions', () => {
      const dims = freeDiffusionService.parseDimensions('1792x1024');
      expect(dims).toEqual({ width: 1792, height: 1024 });
    });

    it('should correctly parse 1024x1792 portrait dimensions', () => {
      const dims = freeDiffusionService.parseDimensions('1024x1792');
      expect(dims).toEqual({ width: 1024, height: 1792 });
    });
  });

  describe('POST /api/generations/ai Validation', () => {
    it('should reject request when creativeIdea is missing or too short', async () => {
      const res = await request(app)
        .post('/api/generations/ai')
        .field('creativeIdea', 'hi')
        .field('organizationName', 'Acme AI')
        .attach('logo', validLogoBuffer, 'logo.png');

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('at least 5 characters');
    });

    it('should reject request when logo is missing', async () => {
      const res = await request(app)
        .post('/api/generations/ai')
        .field('creativeIdea', 'Futuristic renewable energy platform')
        .field('organizationName', 'Acme AI');

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/logo/i);
    });
  });
});
