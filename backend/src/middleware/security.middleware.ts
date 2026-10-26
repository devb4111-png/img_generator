import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';

/**
 * General API Rate Limiter
 * Limits each IP to 150 requests per 15 minutes
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP. Please try again after 15 minutes.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

/**
 * Image Generation Specific Rate Limiter
 * Protects compute-heavy Sharp and Diffusion workloads
 * Limits each IP to 30 generations per 15 minutes
 */
export const generationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Image generation limit reached for this IP. Please wait before creating more templates.',
      code: 'GENERATION_RATE_LIMIT_EXCEEDED',
    },
  },
});

/**
 * Validates uploaded logo file buffer via Magic Number and Content Analysis
 * Detects renamed executables, malicious scripts, and XXE injection
 */
export const validateUploadedLogo = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const originalName = req.file.originalname || '';
  const ext = path.extname(originalName).toLowerCase();

  try {
    const buffer = fs.readFileSync(filePath);

    // 1. Minimum file size check
    if (buffer.length < 16) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(400).json({
        success: false,
        error: { message: 'Uploaded file is too small or corrupt.' },
      });
      return;
    }

    // 2. Validate PNG by magic bytes: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
    if (ext === '.png') {
      const isPng =
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a;

      if (!isPng) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid PNG file. File content does not match the PNG header specification.',
            code: 'INVALID_FILE_SIGNATURE',
          },
        });
        return;
      }
    }

    // 3. Validate SVG by parsing content for malicious script tags or XXE
    if (ext === '.svg') {
      const content = buffer.toString('utf8');

      // Must contain SVG element
      if (!/<svg[\s>]/i.test(content)) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(400).json({
          success: false,
          error: { message: 'Invalid SVG file: missing <svg> element.', code: 'INVALID_SVG' },
        });
        return;
      }

      // Check for dangerous active scripting or external entities
      const dangerousPatterns = [
        /<script[\s>]/i,
        /onload\s*=/i,
        /onerror\s*=/i,
        /onclick\s*=/i,
        /onmouseover\s*=/i,
        /javascript:/i,
        /<!ENTITY/i,
        /<foreignObject/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          res.status(400).json({
            success: false,
            error: {
              message: 'SVG file contains unsafe scripts, handlers, or external entity definitions.',
              code: 'MALICIOUS_SVG_DETECTED',
            },
          });
          return;
        }
      }
    }

    // File passed security validation
    next();
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to inspect uploaded file security.' },
    });
  }
};

/**
 * Sanitizes user text inputs to strip control characters and prevent injection
 */
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        // Strip null bytes and ASCII control characters except standard whitespace
        req.body[key] = req.body[key]
          .replace(/\0/g, '')
          .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F]/g, '')
          .trim();
      }
    }
  }
  next();
};

/**
 * Validates filename against path traversal attacks (../, %2e%2e, null bytes)
 */
export const isSafeFilename = (filename: string): boolean => {
  if (!filename || typeof filename !== 'string') return false;
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\') || filename.includes('\0')) {
    return false;
  }
  // Allow alphanumeric, underscores, hyphens, and single periods
  return /^[a-zA-Z0-9_\-\.]+$/.test(filename);
};
