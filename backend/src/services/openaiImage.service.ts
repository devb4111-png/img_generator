import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/env';
import { geminiImageService, GeneratedBackgroundResult, ImageSize, ImageQuality, ImageStyle, GenerateImageOptions } from './geminiImage.service';
import { freeDiffusionService } from './freeDiffusion.service';

export { ImageSize, ImageQuality, ImageStyle, GenerateImageOptions, GeneratedBackgroundResult };

export class OpenAIImageService {
  private openai: OpenAI | null = null;

  constructor() {
    if (config.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: config.openaiApiKey,
        timeout: 60000,
        maxRetries: 1,
      });
    }
  }

  private getClient(): OpenAI {
    const key = process.env.OPENAI_API_KEY || config.openaiApiKey;
    if (!key || key.trim().length === 0) {
      throw new Error(
        'OpenAI API key is missing. Please set OPENAI_API_KEY in backend/.env to use OpenAI image generation.'
      );
    }

    if (!this.openai || this.openai.apiKey !== key) {
      this.openai = new OpenAI({
        apiKey: key,
        timeout: 60000,
        maxRetries: 1,
      });
    }

    return this.openai;
  }

  public parseDimensions(size: ImageSize = '1024x1024'): { width: number; height: number } {
    return geminiImageService.parseDimensions(size);
  }

  /**
   * Generates a background image using Free Diffusion Studio, Gemini, or OpenAI DALL-E
   */
  public async generateBackground(
    options: GenerateImageOptions
  ): Promise<GeneratedBackgroundResult> {
    const isFreeProvider = config.aiProvider === 'free';

    // 0. Free Tier Priority (100% free, zero paid keys, zero credit card)
    if (isFreeProvider) {
      console.log('[AIImageService] Free tier active: Delegating to 100% Free Diffusion Studio...');
      return freeDiffusionService.generateBackgroundResult(options);
    }

    const hasGeminiKey = Boolean(config.geminiApiKey || process.env.GEMINI_API_KEY);
    const hasOpenAiKey = Boolean(config.openaiApiKey || process.env.OPENAI_API_KEY);

    // If Gemini key is provided, prefer Gemini
    if (hasGeminiKey) {
      console.log('[AIImageService] Delegating background generation to GeminiImageService...');
      return geminiImageService.generateBackground(options);
    }

    if (!hasOpenAiKey) {
      console.log('[AIImageService] No paid keys configured. Delegating to Free Diffusion Studio...');
      return freeDiffusionService.generateBackgroundResult(options);
    }

    const client = this.getClient();
    const model = process.env.OPENAI_IMAGE_MODEL || config.openaiImageModel || 'gpt-image-1-mini';
    const size = options.size || '1024x1024';
    const quality = options.quality || 'standard';
    const style = options.style || 'vivid';
    const outputDir = options.outputDir || config.generatedDir;

    console.log(`[OpenAIImageService] Calling OpenAI Image API (Model: ${model}, Size: ${size})...`);

    try {
      const requestPayload: Parameters<typeof client.images.generate>[0] = {
        model,
        prompt: options.prompt,
        n: 1,
        size,
        ...(model === 'dall-e-3' ? { quality, style, response_format: 'b64_json' } : {}),
      };

      const response = (await client.images.generate(
        requestPayload
      )) as OpenAI.Images.ImagesResponse;

      const imageData = response.data?.[0];
      if (!imageData || (!imageData.b64_json && !imageData.url)) {
        throw new Error('OpenAI Image API returned an empty or invalid image response.');
      }

      let imageBuffer: Buffer;
      if (imageData.b64_json) {
        imageBuffer = Buffer.from(imageData.b64_json, 'base64');
      } else if (imageData.url) {
        const res = await fetch(imageData.url);
        if (!res.ok) {
          throw new Error(`Failed to download image from OpenAI URL: HTTP ${res.status}`);
        }
        const arrayBuf = await res.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuf);
      } else {
        throw new Error('Image data missing from OpenAI response.');
      }

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const randomHex = crypto.randomBytes(6).toString('hex');
      const filename = `ai-bg-${Date.now()}-${randomHex}.png`;
      const filePath = path.join(outputDir, filename);

      fs.writeFileSync(filePath, imageBuffer);

      const dimensions = this.parseDimensions(size);

      console.log(`[OpenAIImageService] Background image generated successfully: ${filename}`);

      return {
        filePath,
        width: dimensions.width,
        height: dimensions.height,
        revisedPrompt: imageData.revised_prompt,
      };
    } catch (err: unknown) {
      console.warn('[OpenAIImageService] OpenAI API error or quota reached:', err);
      console.log('[OpenAIImageService] Automatically falling back to Free Diffusion Studio (zero-cost, no billing)...');
      return freeDiffusionService.generateBackgroundResult(options);
    }
  }
}

export const openaiImageService = new OpenAIImageService();
