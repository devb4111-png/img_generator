import sharp, { Sharp } from 'sharp';
import fs from 'fs';
import path from 'path';
import { ITemplatePlacements } from '../models/Template';

export interface CompositeOptions {
  backgroundPath: string;
  logoPath: string;
  organizationName: string;
  targetWidth: number;
  targetHeight: number;
  placements: ITemplatePlacements;
  outputPath: string;
}

export interface CompositeResult {
  outputPath: string;
  width: number;
  height: number;
  fileSizeBytes: number;
}

/**
 * Escapes special XML characters to prevent SVG syntax errors or injection
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Wraps or truncates text to fit within maxWidth and maxLines
 */
function wrapText(
  text: string,
  maxCharsPerLine: number,
  maxLines: number = 2
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) {
        break;
      }
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  // If there are still words left, truncate the last line with ellipsis
  if (words.length > 0 && lines.length === maxLines) {
    const joined = lines.join(' ');
    if (joined.length < text.length) {
      lines[lines.length - 1] =
        lines[lines.length - 1].slice(0, Math.max(0, maxCharsPerLine - 3)) + '...';
    }
  }

  return lines.length > 0 ? lines : [text];
}

export class ImageCompositorService {
  /**
   * Performs the multi-layer compositing of background, resized logo, and organization name
   */
  public async compositeTemplateImage(options: CompositeOptions): Promise<CompositeResult> {
    const {
      backgroundPath,
      logoPath,
      organizationName,
      targetWidth,
      targetHeight,
      placements,
      outputPath,
    } = options;

    if (!fs.existsSync(backgroundPath)) {
      throw new Error(`Background template image not found at: ${backgroundPath}`);
    }
    if (!fs.existsSync(logoPath)) {
      throw new Error(`Uploaded logo image not found at: ${logoPath}`);
    }

    // 1. Calculate actual pixel positions and bounding boxes
    const isLogoNorm = placements.logo.isNormalized ?? (placements.logo.x <= 1 && placements.logo.y <= 1);
    const logoX = Math.round(isLogoNorm ? placements.logo.x * targetWidth : placements.logo.x);
    const logoY = Math.round(isLogoNorm ? placements.logo.y * targetHeight : placements.logo.y);
    const logoBoxWidth = Math.round(isLogoNorm ? placements.logo.width * targetWidth : placements.logo.width);
    const logoBoxHeight = Math.round(isLogoNorm ? placements.logo.height * targetHeight : placements.logo.height);

    const isTextNorm = placements.organizationName.isNormalized ?? (placements.organizationName.x <= 1 && placements.organizationName.y <= 1);
    const textX = Math.round(isTextNorm ? placements.organizationName.x * targetWidth : placements.organizationName.x);
    const textY = Math.round(isTextNorm ? placements.organizationName.y * targetHeight : placements.organizationName.y);
    const maxTextWidth = Math.round(isTextNorm ? placements.organizationName.maxTextWidth * targetWidth : placements.organizationName.maxTextWidth);

    // 2. Process and resize logo
    const isSvg = path.extname(logoPath).toLowerCase() === '.svg';
    let logoPipeline: Sharp;

    if (isSvg) {
      const svgBuffer = fs.readFileSync(logoPath);
      logoPipeline = sharp(svgBuffer, { density: 300 });
    } else {
      logoPipeline = sharp(logoPath);
    }

    const processedLogoBuffer = await logoPipeline
      .resize({
        width: logoBoxWidth,
        height: logoBoxHeight,
        fit: 'inside', // preserve aspect ratio within target bounding box
        withoutEnlargement: false,
      })
      .png()
      .toBuffer();

    const logoMetadata = await sharp(processedLogoBuffer).metadata();
    const finalLogoWidth = logoMetadata.width || logoBoxWidth;
    const finalLogoHeight = logoMetadata.height || logoBoxHeight;

    // Center the logo within the designated bounding box
    const logoLeft = Math.max(0, Math.round(logoX + (logoBoxWidth - finalLogoWidth) / 2));
    const logoTop = Math.max(0, Math.round(logoY + (logoBoxHeight - finalLogoHeight) / 2));

    // 3. Render organization name as SVG overlay
    let fontSize = placements.organizationName.fontSize || 42;
    const fontColor = placements.organizationName.fontColor || '#FFFFFF';
    const textAlign = placements.organizationName.textAlign || 'left';

    // Adaptive font scaling for long names
    const approxCharWidth = fontSize * 0.58;
    const maxCharsPerLine = Math.max(10, Math.floor(maxTextWidth / approxCharWidth));
    if (organizationName.length > maxCharsPerLine * 2) {
      fontSize = Math.max(22, Math.floor(fontSize * 0.8));
    }

    const textLines = wrapText(organizationName, maxCharsPerLine, 2);
    const lineHeight = Math.round(fontSize * 1.25);
    const textSvgHeight = (textLines.length + 1) * lineHeight;

    const svgAnchor =
      textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start';

    const anchorX =
      textAlign === 'center' ? maxTextWidth / 2 : textAlign === 'right' ? maxTextWidth : 0;

    const tspans = textLines
      .map(
        (line, idx) =>
          `<tspan x="${anchorX}" dy="${idx === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
      )
      .join('\n');

    const textSvg = `
      <svg width="${maxTextWidth}" height="${textSvgHeight}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .org-title {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: ${fontSize}px;
            font-weight: 700;
            fill: ${fontColor};
            letter-spacing: -0.01em;
          }
        </style>
        <text x="${anchorX}" y="${fontSize}" text-anchor="${svgAnchor}" class="org-title">
          ${tspans}
        </text>
      </svg>
    `;

    const textSvgBuffer = Buffer.from(textSvg);

    // 4. Ensure destination directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 5. Composite background + logo + text overlay
    await sharp(backgroundPath)
      .resize({
        width: targetWidth,
        height: targetHeight,
        fit: 'cover',
        position: 'center',
      })
      .composite([
        {
          input: processedLogoBuffer,
          left: Math.min(targetWidth - finalLogoWidth, Math.max(0, logoLeft)),
          top: Math.min(targetHeight - finalLogoHeight, Math.max(0, logoTop)),
        },
        {
          input: textSvgBuffer,
          left: Math.min(targetWidth - maxTextWidth, Math.max(0, textX)),
          top: Math.min(targetHeight - textSvgHeight, Math.max(0, textY)),
        },
      ])
      .png({ quality: 95, compressionLevel: 8 })
      .toFile(outputPath);

    const outputStats = fs.statSync(outputPath);

    return {
      outputPath,
      width: targetWidth,
      height: targetHeight,
      fileSizeBytes: outputStats.size,
    };
  }
}

export const imageCompositor = new ImageCompositorService();
