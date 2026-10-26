import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/env';
import { proceduralCanvas } from './proceduralCanvas.service';

export type ImageSize = '1024x1024' | '1024x1792' | '1792x1024';

export interface FreeDiffusionOptions {
  prompt: string;
  width: number;
  height: number;
  outputDir: string;
  allowFallback?: boolean;
}

export interface GeneratedBackgroundResult {
  filePath: string;
  width: number;
  height: number;
  revisedPrompt?: string;
  provider: 'free-diffusion' | 'thematic-ai-engine' | 'imagen-3.0-fast' | 'gemini';
}

export class FreeDiffusionService {
  /**
   * Parses dimension string into width and height
   */
  public parseDimensions(size: ImageSize = '1024x1024'): { width: number; height: number } {
    switch (size) {
      case '1792x1024':
        return { width: 1792, height: 1024 };
      case '1024x1792':
        return { width: 1024, height: 1792 };
      case '1024x1024':
      default:
        return { width: 1024, height: 1024 };
    }
  }

  /**
   * Determines the optimal base diffusion render resolution (multiples of 64)
   */
  private getBaseDiffusionDimensions(targetWidth: number, targetHeight: number): { width: number; height: number } {
    if (targetWidth > targetHeight) {
      // Landscape 16:9
      return { width: 640, height: 384 };
    } else if (targetHeight > targetWidth) {
      // Portrait 9:16
      return { width: 384, height: 640 };
    }
    // Square 1:1
    return { width: 512, height: 512 };
  }

  /**
   * Sanitizes and cleans user prompt for diffusion models
   * Trims verbose explanations while preserving core visual essence
   */
  private sanitizeDiffusionPrompt(rawPrompt: string): string {
    let clean = rawPrompt.replace(/\s+/g, ' ').trim();
    // Diffusion models perform best with concise keyword descriptions (< 400 chars)
    if (clean.length > 400) {
      clean = clean.slice(0, 400).replace(/[,\s]+[^,\s]*$/, '');
    }
    return `${clean}, clean photorealistic commercial photography, 8k resolution, crisp studio lighting, elegant clean composition, cinematic depth of field, high quality`;
  }

  /**
   * Generates a 100% free, photorealistic AI diffusion background
   * using the open community Stable Diffusion cluster.
   * Requires ZERO paid API keys, ZERO billing, and ZERO credit cards.
   */
  public async generateBackground(options: FreeDiffusionOptions): Promise<string> {
    const { prompt, width, height, outputDir, allowFallback = true } = options;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const randomHex = crypto.randomBytes(6).toString('hex');
    const filename = `ai-diffusion-${Date.now()}-${randomHex}.png`;
    const outputPath = path.join(outputDir, filename);

    const apiKey = config.aiHordeApiKey || process.env.AI_HORDE_API_KEY || '0000000000';
    const baseDims = this.getBaseDiffusionDimensions(width, height);
    const enhancedPrompt = this.sanitizeDiffusionPrompt(prompt);

    console.log(`[FreeDiffusionService] Requesting free photorealistic AI diffusion generation...`);
    console.log(`[FreeDiffusionService] Resolution: ${baseDims.width}x${baseDims.height} -> Target: ${width}x${height}`);

    try {
      // 1. Submit async request to open AI cluster
      const submitRes = await fetch('https://aihorde.net/api/v2/generate/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
          'Client-Agent': 'TeamConnect:1.0:community',
        },
        body: JSON.stringify({
          prompt: `${enhancedPrompt} ### blurry, low quality, distorted, bad anatomy, text, watermark, signature, cartoon, 3d render, vector art, clipart, child drawing, amateur`,
          params: {
            width: baseDims.width,
            height: baseDims.height,
            steps: 25,
            n: 1,
          },
        }),
      });

      if (!submitRes.ok) {
        throw new Error(`Free AI cluster returned HTTP ${submitRes.status}`);
      }

      const submitData = (await submitRes.json()) as { id?: string; message?: string };
      if (!submitData.id) {
        throw new Error(`Failed to queue free generation: ${submitData.message || 'No job ID'}`);
      }

      const jobId = submitData.id;
      console.log(`[FreeDiffusionService] Job queued (${jobId}). Waiting for worker synthesis...`);

      // 2. Poll for completion (up to 45 seconds)
      const startTime = Date.now();
      let imageUrl: string | null = null;

      while (Date.now() - startTime < 45000) {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const statusRes = await fetch(`https://aihorde.net/api/v2/generate/status/${jobId}`);
        if (!statusRes.ok) continue;

        const statusData = (await statusRes.json()) as {
          finished?: number;
          faulted?: boolean;
          wait_time?: number;
          queue_position?: number;
          generations?: Array<{ img?: string }>;
        };

        if (statusData.faulted) {
          throw new Error('Free AI cluster worker encountered a fault processing the prompt.');
        }

        if (statusData.finished && statusData.generations?.[0]?.img) {
          imageUrl = statusData.generations[0].img;
          break;
        }

        if (statusData.queue_position !== undefined && statusData.queue_position > 0) {
          console.log(`[FreeDiffusionService] In queue (position: ${statusData.queue_position}, wait: ~${statusData.wait_time ?? '?'}s)`);
        }
      }

      if (!imageUrl) {
        throw new Error('Free AI cluster synthesis timed out (>45s).');
      }

      // 3. Download the generated diffusion image
      console.log('[FreeDiffusionService] Image ready, downloading diffusion buffer...');
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) {
        throw new Error(`Failed to download diffusion image: HTTP ${imgRes.status}`);
      }

      const rawBuffer = Buffer.from(await imgRes.arrayBuffer());

      // 4. Upscale / Resize to requested target dimensions in crisp high-fidelity PNG
      await sharp(rawBuffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
          kernel: 'lanczos3',
        })
        .png({ quality: 100, compressionLevel: 6 })
        .toFile(outputPath);

      console.log(`[FreeDiffusionService] Successfully generated photorealistic AI background: ${filename}`);
      return outputPath;
    } catch (err) {
      console.warn('[FreeDiffusionService] Remote diffusion synthesis error:', err);

      if (allowFallback || config.enableAiFallback) {
        console.log('[FreeDiffusionService] Switching to Executive Studio Editorial fallback...');
        return proceduralCanvas.generateAestheticBackdrop({
          prompt,
          width,
          height,
          outputDir,
        });
      }

      throw err;
    }
  }

  /**
   * Standardized generation method returning a full result object
   */
  public async generateBackgroundResult(options: {
    prompt: string;
    size?: ImageSize;
    outputDir?: string;
    allowFallback?: boolean;
  }): Promise<GeneratedBackgroundResult> {
    const size = options.size || '1024x1024';
    const dimensions = this.parseDimensions(size);
    const outputDir = options.outputDir || config.generatedDir;

    const filePath = await this.generateBackground({
      prompt: options.prompt,
      width: dimensions.width,
      height: dimensions.height,
      outputDir,
      allowFallback: options.allowFallback ?? true,
    });

    return {
      filePath,
      width: dimensions.width,
      height: dimensions.height,
      revisedPrompt: options.prompt,
      provider: 'free-diffusion',
    };
  }
}

export const freeDiffusionService = new FreeDiffusionService();
