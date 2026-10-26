import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export interface ProceduralCanvasOptions {
  prompt: string;
  width: number;
  height: number;
  outputDir: string;
}

export class ProceduralCanvasService {
  /**
   * Generates a sleek, executive, ultra-modern studio editorial background.
   * Eliminates cartoon/childish shapes and replaces them with premium atmospheric
   * lighting, architectural gradient facets, and clean high-end commercial branding space.
   */
  public async generateAestheticBackdrop(options: ProceduralCanvasOptions): Promise<string> {
    const { prompt, width, height, outputDir } = options;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const randomHex = crypto.randomBytes(6).toString('hex');
    const filename = `editorial-template-${Date.now()}-${randomHex}.png`;
    const filePath = path.join(outputDir, filename);

    const svgArtwork = this.generateExecutiveStudioSvg(prompt, width, height);

    await sharp(Buffer.from(svgArtwork))
      .resize(width, height)
      .png({ quality: 100 })
      .toFile(filePath);

    console.log(`[ProceduralCanvasService] Generated executive studio editorial template: ${filename}`);
    return filePath;
  }

  /**
   * Generates a premium commercial studio editorial backdrop tailored to the prompt's color themes
   */
  private generateExecutiveStudioSvg(prompt: string, w: number, h: number): string {
    const lower = prompt.toLowerCase();

    // Curated high-end color themes based on prompt semantics
    let bgBase1 = '#030712'; // Deep slate / obsidian
    let bgBase2 = '#0f172a'; // Midnight navy
    let accent1 = '#38bdf8'; // Sky cyan
    let accent2 = '#818cf8'; // Soft indigo
    let ambientGlow = '#0284c7';

    if (lower.includes('solar') || lower.includes('sun') || lower.includes('gold') || lower.includes('amber') || lower.includes('warm') || lower.includes('diwali')) {
      bgBase1 = '#09040e';
      bgBase2 = '#1f0d03';
      accent1 = '#fbbf24'; // Warm amber gold
      accent2 = '#f97316'; // Deep sunset
      ambientGlow = '#d97706';
    } else if (lower.includes('eco') || lower.includes('green') || lower.includes('nature') || lower.includes('forest') || lower.includes('sustainability')) {
      bgBase1 = '#01140e';
      bgBase2 = '#062d22';
      accent1 = '#34d399'; // Emerald
      accent2 = '#10b981'; // Mint
      ambientGlow = '#059669';
    } else if (lower.includes('cyber') || lower.includes('quantum') || lower.includes('ai') || lower.includes('future') || lower.includes('tech')) {
      bgBase1 = '#030712';
      bgBase2 = '#0a1026';
      accent1 = '#38bdf8'; // Electric blue
      accent2 = '#c084fc'; // Violet
      ambientGlow = '#6366f1';
    } else if (lower.includes('space') || lower.includes('cosmic') || lower.includes('ocean') || lower.includes('blue')) {
      bgBase1 = '#020617';
      bgBase2 = '#0c1b33';
      accent1 = '#38bdf8';
      accent2 = '#60a5fa';
      ambientGlow = '#2563eb';
    }

    const orb1X = Math.round(w * 0.75);
    const orb1Y = Math.round(h * 0.35);
    const orb1R = Math.round(Math.max(w, h) * 0.45);

    const orb2X = Math.round(w * 0.20);
    const orb2Y = Math.round(h * 0.70);
    const orb2R = Math.round(Math.max(w, h) * 0.35);

    return `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="studioBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${bgBase1}" />
            <stop offset="50%" stop-color="${bgBase2}" />
            <stop offset="100%" stop-color="${bgBase1}" />
          </linearGradient>

          <radialGradient id="lightBloom1" cx="${orb1X}" cy="${orb1Y}" r="${orb1R}" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="${accent1}" stop-opacity="0.38" />
            <stop offset="50%" stop-color="${ambientGlow}" stop-opacity="0.16" />
            <stop offset="100%" stop-color="${bgBase1}" stop-opacity="0" />
          </radialGradient>

          <radialGradient id="lightBloom2" cx="${orb2X}" cy="${orb2Y}" r="${orb2R}" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="${accent2}" stop-opacity="0.30" />
            <stop offset="60%" stop-color="${bgBase2}" stop-opacity="0.10" />
            <stop offset="100%" stop-color="${bgBase1}" stop-opacity="0" />
          </radialGradient>

          <filter id="softDiffusion" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="80" />
          </filter>

          <linearGradient id="beamLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${accent1}" stop-opacity="0.05" />
            <stop offset="40%" stop-color="${accent1}" stop-opacity="0.45" />
            <stop offset="70%" stop-color="${accent2}" stop-opacity="0.35" />
            <stop offset="100%" stop-color="${accent1}" stop-opacity="0.05" />
          </linearGradient>

          <linearGradient id="glassBorder" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.05" />
            <stop offset="50%" stop-color="#ffffff" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05" />
          </linearGradient>
        </defs>

        <!-- Deep Base Canvas -->
        <rect width="${w}" height="${h}" fill="url(#studioBg)" />

        <!-- Cinematic Ambient Blooms -->
        <circle cx="${orb1X}" cy="${orb1Y}" r="${orb1R}" fill="url(#lightBloom1)" filter="url(#softDiffusion)" />
        <circle cx="${orb2X}" cy="${orb2Y}" r="${orb2R}" fill="url(#lightBloom2)" filter="url(#softDiffusion)" />

        <!-- Architectural Glass Facets (Clean, Modern, Geometric) -->
        <g opacity="0.45">
          <polygon points="0,${Math.round(h * 0.65)} ${Math.round(w * 0.45)},${Math.round(h * 0.28)} ${Math.round(w * 0.88)},${Math.round(h * 0.52)} ${w},${Math.round(h * 0.38)} ${w},${h} 0,${h}" fill="${bgBase2}" opacity="0.6" />
          <line x1="0" y1="${Math.round(h * 0.65)}" x2="${Math.round(w * 0.45)}" y2="${Math.round(h * 0.28)}" stroke="url(#beamLine)" stroke-width="1.8" />
          <line x1="${Math.round(w * 0.45)}" y1="${Math.round(h * 0.28)}" x2="${Math.round(w * 0.88)}" y2="${Math.round(h * 0.52)}" stroke="url(#beamLine)" stroke-width="2" />
          <line x1="${Math.round(w * 0.88)}" y1="${Math.round(h * 0.52)}" x2="${w}" y2="${Math.round(h * 0.38)}" stroke="url(#beamLine)" stroke-width="1.5" />
        </g>

        <!-- Subtle Constellation Light Points -->
        <circle cx="${Math.round(w * 0.45)}" cy="${Math.round(h * 0.28)}" r="3.5" fill="#ffffff" opacity="0.9" />
        <circle cx="${Math.round(w * 0.88)}" cy="${Math.round(h * 0.52)}" r="3" fill="${accent1}" opacity="0.8" />
        <circle cx="${Math.round(w * 0.25)}" cy="${Math.round(h * 0.42)}" r="2" fill="${accent2}" opacity="0.6" />

        <!-- Clean Lower Frosted Glass Banner for Brand Authority Typography -->
        <rect x="0" y="${Math.round(h * 0.74)}" width="${w}" height="${Math.round(h * 0.26)}" fill="#020617" opacity="0.82" />
        <line x1="0" y1="${Math.round(h * 0.74)}" x2="${w}" y2="${Math.round(h * 0.74)}" stroke="url(#glassBorder)" stroke-width="1.2" />

        <!-- Subtle High-Contrast Brand Watermark Frame -->
        <rect x="24" y="24" width="${w - 48}" height="${h - 48}" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.08" rx="8" />
      </svg>
    `;
  }
}

export const proceduralCanvas = new ProceduralCanvasService();
