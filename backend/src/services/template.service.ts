import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Template, ITemplate } from '../models/Template';
import { dbStatus } from '../config/db';

const TEMPLATES_DIR = path.resolve(process.cwd(), 'templates');

export interface SeedTemplateDefinition {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  bgFilename: string;
  previewFilename: string;
  sourceImageFilename?: string;
  svgGenerator?: (width: number, height: number) => string;
  placements: ITemplate['placements'];
}

export const SEED_TEMPLATES: SeedTemplateDefinition[] = [
  {
    id: 'tpl-corp-horizon',
    name: 'Corporate Horizon',
    description: 'Landscape executive banner with sleek navy gradients and clean typography.',
    width: 1200,
    height: 630,
    bgFilename: 'corporate-horizon-bg.png',
    previewFilename: 'corporate-horizon-preview.png',
    svgGenerator: (w, h) => `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0a1128" />
            <stop offset="50%" stop-color="#101f42" />
            <stop offset="100%" stop-color="#1c1938" />
          </linearGradient>
          <radialGradient id="r1" cx="85%" cy="20%" r="55%">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="r2" cx="15%" cy="80%" r="45%">
            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#g1)" />
        <rect width="${w}" height="${h}" fill="url(#r1)" />
        <rect width="${w}" height="${h}" fill="url(#r2)" />
        <line x1="96" y1="360" x2="1104" y2="360" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1.5" />
      </svg>
    `,
    placements: {
      logo: {
        x: 0.08,
        y: 0.14,
        width: 0.16,
        height: 0.22,
        isNormalized: true,
      },
      organizationName: {
        x: 0.08,
        y: 0.68,
        fontSize: 48,
        fontColor: '#FFFFFF',
        textAlign: 'left',
        maxTextWidth: 0.84,
        isNormalized: true,
      },
    },
  },
  {
    id: 'tpl-tech-summit',
    name: 'Tech Summit Square',
    description: 'High-impact 1:1 square canvas tailored for social media & community announcements.',
    width: 1080,
    height: 1080,
    bgFilename: 'tech-summit-bg.png',
    previewFilename: 'tech-summit-preview.png',
    svgGenerator: (w, h) => `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0b0f19" />
            <stop offset="60%" stop-color="#111827" />
            <stop offset="100%" stop-color="#1e1035" />
          </linearGradient>
          <radialGradient id="glowPurple" cx="50%" cy="30%" r="40%">
            <stop offset="0%" stop-color="#a855f7" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#a855f7" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="glowCyan" cx="80%" cy="80%" r="45%">
            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#06b6d4" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#bg)" />
        <rect width="${w}" height="${h}" fill="url(#glowPurple)" />
        <rect width="${w}" height="${h}" fill="url(#glowCyan)" />
        <circle cx="540" cy="380" r="140" fill="#ffffff" fill-opacity="0.03" stroke="#a855f7" stroke-opacity="0.2" stroke-width="1.5" />
      </svg>
    `,
    placements: {
      logo: {
        x: 0.38,
        y: 0.22,
        width: 0.24,
        height: 0.24,
        isNormalized: true,
      },
      organizationName: {
        x: 0.1,
        y: 0.68,
        fontSize: 48,
        fontColor: '#F8FAFC',
        textAlign: 'center',
        maxTextWidth: 0.8,
        isNormalized: true,
      },
    },
  },
  {
    id: 'tpl-executive-crest',
    name: 'Executive Crest',
    description: '16:9 widescreen presentation canvas with rich charcoal, emerald glow, and gold accents.',
    width: 1920,
    height: 1080,
    bgFilename: 'executive-crest-bg.png',
    previewFilename: 'executive-crest-preview.png',
    svgGenerator: (w, h) => `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="darkBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#090d16" />
            <stop offset="50%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#071b1e" />
          </linearGradient>
          <radialGradient id="emeraldAura" cx="20%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.22" />
            <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="amberAccent" cx="80%" cy="20%" r="40%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#darkBg)" />
        <rect width="${w}" height="${h}" fill="url(#emeraldAura)" />
        <rect width="${w}" height="${h}" fill="url(#amberAccent)" />
        <line x1="160" y1="360" x2="160" y2="760" stroke="#10b981" stroke-opacity="0.5" stroke-width="4" stroke-linecap="round" />
      </svg>
    `,
    placements: {
      logo: {
        x: 0.74,
        y: 0.14,
        width: 0.16,
        height: 0.18,
        isNormalized: true,
      },
      organizationName: {
        x: 0.12,
        y: 0.44,
        fontSize: 64,
        fontColor: '#FFFFFF',
        textAlign: 'left',
        maxTextWidth: 0.6,
        isNormalized: true,
      },
    },
  },
  {
    id: 'tpl-diwali-solar',
    name: 'Diwali Solar Greetings',
    description: 'Festive Diwali celebration banner featuring solar panels, diyas, fireworks, and dedicated brand zones.',
    width: 1080,
    height: 1080,
    bgFilename: 'diwali-solar-bg.png',
    previewFilename: 'diwali-solar-preview.png',
    sourceImageFilename: 'diwali-solar-source.jpg',
    placements: {
      logo: {
        x: 0.38,
        y: 0.025,
        width: 0.24,
        height: 0.11,
        isNormalized: true,
      },
      organizationName: {
        x: 0.1,
        y: 0.88,
        fontSize: 42,
        fontColor: '#4A1D96',
        textAlign: 'center',
        maxTextWidth: 0.8,
        isNormalized: true,
      },
    },
  },
];

export class TemplateService {
  /**
   * Generates physical template PNG backgrounds on disk using Sharp
   */
  public async ensureTemplateAssetsOnDisk(): Promise<void> {
    if (!fs.existsSync(TEMPLATES_DIR)) {
      fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
    }

    for (const tpl of SEED_TEMPLATES) {
      const bgPath = path.join(TEMPLATES_DIR, tpl.bgFilename);
      const prevPath = path.join(TEMPLATES_DIR, tpl.previewFilename);

      if (!fs.existsSync(bgPath)) {
        if (tpl.sourceImageFilename) {
          const srcPath = path.join(TEMPLATES_DIR, tpl.sourceImageFilename);
          if (fs.existsSync(srcPath)) {
            await sharp(srcPath)
              .resize(tpl.width, tpl.height, { fit: 'fill' })
              .png({ quality: 95 })
              .toFile(bgPath);
            console.log(`[TemplateService] Generated template background from source: ${tpl.bgFilename}`);
          }
        } else if (tpl.svgGenerator) {
          const svgContent = tpl.svgGenerator(tpl.width, tpl.height);
          await sharp(Buffer.from(svgContent))
            .png({ quality: 95 })
            .toFile(bgPath);
          console.log(`[TemplateService] Generated template background: ${tpl.bgFilename}`);
        }
      }

      if (!fs.existsSync(prevPath)) {
        // Thumbnail preview: 400px width
        const prevWidth = 400;
        const prevHeight = Math.round((tpl.height / tpl.width) * prevWidth);
        await sharp(bgPath)
          .resize(prevWidth, prevHeight)
          .png()
          .toFile(prevPath);
        console.log(`[TemplateService] Generated template preview: ${tpl.previewFilename}`);
      }
    }
  }

  /**
   * Seeds templates into MongoDB if database is connected and collection is empty
   */
  public async seedDatabaseIfConnected(): Promise<void> {
    await this.ensureTemplateAssetsOnDisk();

    if (!dbStatus.isConnected) {
      return;
    }

    try {
      const count = await Template.countDocuments();
      if (count === 0) {
        console.log('[TemplateService] Seeding default templates into MongoDB...');
        for (const seed of SEED_TEMPLATES) {
          await Template.create({
            name: seed.name,
            description: seed.description,
            width: seed.width,
            height: seed.height,
            backgroundImagePath: path.join('templates', seed.bgFilename),
            previewImagePath: path.join('templates', seed.previewFilename),
            placements: seed.placements,
            isActive: true,
          });
        }
        console.log('[TemplateService] Templates successfully seeded.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[TemplateService] Could not seed database:', msg);
    }
  }

  /**
   * Retrieves active templates from MongoDB or in-memory fallback
   */
  public async getActiveTemplates() {
    await this.ensureTemplateAssetsOnDisk();

    if (dbStatus.isConnected) {
      try {
        const templates = await Template.find({ isActive: true }).sort({ createdAt: -1 });
        if (templates.length > 0) {
          return templates.map((t) => ({
            id: t._id.toString(),
            name: t.name,
            description: t.description,
            width: t.width,
            height: t.height,
            previewUrl: `/api/templates/assets/${path.basename(t.previewImagePath)}`,
            backgroundUrl: `/api/templates/assets/${path.basename(t.backgroundImagePath)}`,
            placements: t.placements,
          }));
        }
      } catch (err) {
        console.warn('[TemplateService] MongoDB query failed, falling back to seed list:', err);
      }
    }

    // In-memory fallback representation
    return SEED_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      width: t.width,
      height: t.height,
      previewUrl: `/api/templates/assets/${t.previewFilename}`,
      backgroundUrl: `/api/templates/assets/${t.bgFilename}`,
      placements: t.placements,
    }));
  }

  /**
   * Finds a template by Mongo ID or seed ID
   */
  public async getTemplateById(id: string) {
    await this.ensureTemplateAssetsOnDisk();

    if (dbStatus.isConnected) {
      try {
        // If valid ObjectId
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
          const t = await Template.findById(id);
          if (t) {
            return {
              id: t._id.toString(),
              name: t.name,
              description: t.description,
              width: t.width,
              height: t.height,
              previewImagePath: path.resolve(process.cwd(), t.previewImagePath),
              backgroundImagePath: path.resolve(process.cwd(), t.backgroundImagePath),
              placements: t.placements,
            };
          }
        }
      } catch (err) {
        console.warn(`[TemplateService] Could not find template by ObjectId ${id}:`, err);
      }
    }

    // Check seed templates
    const seed = SEED_TEMPLATES.find((s) => s.id === id || s.name.toLowerCase() === id.toLowerCase());
    if (seed) {
      return {
        id: seed.id,
        name: seed.name,
        description: seed.description,
        width: seed.width,
        height: seed.height,
        previewImagePath: path.join(TEMPLATES_DIR, seed.previewFilename),
        backgroundImagePath: path.join(TEMPLATES_DIR, seed.bgFilename),
        placements: seed.placements,
      };
    }

    return null;
  }
}

export const templateService = new TemplateService();
