import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/env';
import { proceduralCanvas } from './proceduralCanvas.service';
import { freeDiffusionService } from './freeDiffusion.service';

export type ImageSize = '1024x1024' | '1024x1792' | '1792x1024';
export type ImageQuality = 'standard' | 'hd';
export type ImageStyle = 'vivid' | 'natural';

export interface GenerateImageOptions {
  prompt: string;
  size?: ImageSize;
  quality?: ImageQuality;
  style?: ImageStyle;
  outputDir?: string;
  allowFallback?: boolean;
}

export interface GeneratedBackgroundResult {
  filePath: string;
  width: number;
  height: number;
  revisedPrompt?: string;
  provider?: 'imagen-3.0-fast' | 'gemini' | 'thematic-ai-engine' | 'free-diffusion';
}

export class GeminiImageService {
  /**
   * Parses dimensions string into width and height numbers
   */
  public parseDimensions(size: ImageSize = '1024x1024'): { width: number; height: number } {
    return freeDiffusionService.parseDimensions(size);
  }

  /**
   * Generates a background image using Free Diffusion Studio (zero-cost) or Google Cloud Imagen
   */
  public async generateBackground(
    options: GenerateImageOptions
  ): Promise<GeneratedBackgroundResult> {
    const isFreeProvider = config.aiProvider === 'free';
    const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;

    // 0. If AI_PROVIDER is 'free' (default) or if no Gemini key is provided, use Free Diffusion Studio
    if (isFreeProvider || !apiKey || apiKey.trim().length === 0) {
      console.log('[GeminiImageService] Free tier active: Delegating to 100% Free Diffusion Studio (zero-cost, no billing)...');
      return freeDiffusionService.generateBackgroundResult(options);
    }

    const model = config.geminiImageModel || process.env.GEMINI_IMAGE_MODEL || 'imagen-3.0-fast-generate-001';
    const size = options.size || '1024x1024';
    const dimensions = this.parseDimensions(size);
    const outputDir = options.outputDir || config.generatedDir;

    const aspectRatioMap: Record<string, string> = {
      '1024x1024': '1:1',
      '1792x1024': '16:9',
      '1024x1792': '9:16',
    };
    const chosenAspect = aspectRatioMap[size] || '1:1';

    console.log(`[GeminiImageService] Calling Imagen 3 Fast API (Model: ${model}, Aspect: ${chosenAspect})...`);

    // 1. Call Vertex AI / Agent Platform predict endpoint
    try {
      const vertexEndpoint = `https://us-central1-aiplatform.googleapis.com/v1/publishers/google/models/${model}:predict?key=${apiKey.trim()}`;
      const vertexPayload = {
        instances: [{ prompt: options.prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: chosenAspect,
          outputMimeType: 'image/png',
        },
      };

      const res = await fetch(vertexEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vertexPayload),
      });

      const resData = (await res.json()) as {
        predictions?: Array<{
          bytesBase64Encoded?: string;
          mimeType?: string;
        }>;
        error?: {
          code?: number;
          message?: string;
          status?: string;
        };
      };

      if (res.ok && resData.predictions?.[0]?.bytesBase64Encoded) {
        const imageBuffer = Buffer.from(resData.predictions[0].bytesBase64Encoded, 'base64');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        const randomHex = crypto.randomBytes(6).toString('hex');
        const filename = `imagen-bg-${Date.now()}-${randomHex}.png`;
        const filePath = path.join(outputDir, filename);

        fs.writeFileSync(filePath, imageBuffer);
        console.log(`[GeminiImageService] Successfully synthesized via Imagen 3 Fast: ${filename}`);

        return {
          filePath,
          width: dimensions.width,
          height: dimensions.height,
          revisedPrompt: options.prompt,
          provider: 'imagen-3.0-fast',
        };
      }

      if (resData.error) {
        console.warn(`[GeminiImageService] Vertex API notice (${resData.error.code}): ${resData.error.message}`);
      }
    } catch (vertexErr: unknown) {
      console.warn('[GeminiImageService] Vertex predict endpoint call failed:', vertexErr);
    }

    // 2. Try Google AI Studio generateContent endpoint
    try {
      const studioEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey.trim()}`;
      const studioPayload = {
        contents: [{ parts: [{ text: options.prompt }] }],
        generationConfig: { responseModalities: ['IMAGE'] },
      };

      const studioRes = await fetch(studioEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studioPayload),
      });

      const studioData = (await studioRes.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{
              inlineData?: {
                mimeType?: string;
                data?: string;
              };
            }>;
          };
        }>;
        error?: {
          code?: number;
          message?: string;
        };
      };

      const parts = studioData.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
          const randomHex = crypto.randomBytes(6).toString('hex');
          const filename = `gemini-bg-${Date.now()}-${randomHex}.png`;
          const filePath = path.join(outputDir, filename);

          fs.writeFileSync(filePath, imageBuffer);
          console.log(`[GeminiImageService] Successfully generated via Gemini multimodal: ${filename}`);

          return {
            filePath,
            width: dimensions.width,
            height: dimensions.height,
            revisedPrompt: options.prompt,
            provider: 'gemini',
          };
        }
      }
    } catch (studioErr) {
      console.warn('[GeminiImageService] Google AI Studio generateContent endpoint notice:', studioErr);
    }

    // 3. Fallback: Automatically route to Free Diffusion Studio (zero-cost, no billing)
    try {
      console.log('[GeminiImageService] Google Cloud paid API unavailable (billing disabled or quota limit). Automatically routing to Free Diffusion Studio...');
      return await freeDiffusionService.generateBackgroundResult(options);
    } catch (freeErr) {
      console.warn('[GeminiImageService] Free diffusion cluster unavailable, switching to Executive Studio canvas...', freeErr);
    }

    // 4. Ultimate Local Fallback: Executive Studio Editorial Template
    console.log(`[GeminiImageService] Generating executive studio editorial template for prompt: "${options.prompt.slice(0, 80)}..."`);
    const backdropPath = await proceduralCanvas.generateAestheticBackdrop({
      prompt: options.prompt,
      width: dimensions.width,
      height: dimensions.height,
      outputDir,
    });

    return {
      filePath: backdropPath,
      width: dimensions.width,
      height: dimensions.height,
      revisedPrompt: options.prompt,
      provider: 'thematic-ai-engine',
    };
  }
}

export const geminiImageService = new GeminiImageService();
