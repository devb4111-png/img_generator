import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { config } from '../config/env';
import { dbStatus } from '../config/db';
import { templateService } from '../services/template.service';
import { imageCompositor } from '../services/imageCompositor.service';
import { promptBuilder } from '../services/promptBuilder.service';
import { openaiImageService, ImageSize } from '../services/openaiImage.service';
import { ImageGeneration } from '../models/ImageGeneration';

interface InMemoryGenRecord {
  id: string;
  generationMode: 'TEMPLATE' | 'AI';
  organizationName: string;
  uploadedLogoPath: string;
  originalCreativeIdea?: string;
  structuredPrompt?: string;
  finalImagePath: string;
  imageWidth: number;
  imageHeight: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
}

// In-memory generation store for resilience when running without active MongoDB
const inMemoryGenerations = new Map<string, InMemoryGenRecord>();

export const generateTemplateImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { templateId, organizationName } = req.body;
    const logoFile = req.file;

    // 1. Validation
    if (!logoFile) {
      res.status(400).json({
        success: false,
        error: { message: 'Logo file is required (PNG or SVG format).' },
      });
      return;
    }

    if (!organizationName || typeof organizationName !== 'string' || organizationName.trim().length === 0) {
      if (fs.existsSync(logoFile.path)) fs.unlinkSync(logoFile.path);
      res.status(400).json({
        success: false,
        error: { message: 'Organization or authority name is required.' },
      });
      return;
    }

    if (organizationName.trim().length > 120) {
      if (fs.existsSync(logoFile.path)) fs.unlinkSync(logoFile.path);
      res.status(400).json({
        success: false,
        error: { message: 'Organization name cannot exceed 120 characters.' },
      });
      return;
    }

    if (!templateId) {
      if (fs.existsSync(logoFile.path)) fs.unlinkSync(logoFile.path);
      res.status(400).json({
        success: false,
        error: { message: 'templateId is required.' },
      });
      return;
    }

    // 2. Retrieve template configuration
    const template = await templateService.getTemplateById(templateId);
    if (!template) {
      if (fs.existsSync(logoFile.path)) fs.unlinkSync(logoFile.path);
      res.status(404).json({
        success: false,
        error: { message: `Selected template was not found: ${templateId}` },
      });
      return;
    }

    // 3. Composite final PNG
    const randomHex = crypto.randomBytes(6).toString('hex');
    const outputFilename = `gen-tpl-${Date.now()}-${randomHex}.png`;
    const outputPath = path.join(config.generatedDir, outputFilename);

    const trimmedOrgName = organizationName.trim();

    await imageCompositor.compositeTemplateImage({
      backgroundPath: template.backgroundImagePath,
      logoPath: logoFile.path,
      organizationName: trimmedOrgName,
      targetWidth: template.width,
      targetHeight: template.height,
      placements: template.placements,
      outputPath,
    });

    // 4. Save metadata in MongoDB or in-memory store
    let generationId: string;
    const isMongoId = Types.ObjectId.isValid(template.id);

    if (dbStatus.isConnected) {
      try {
        const doc = await ImageGeneration.create({
          generationMode: 'TEMPLATE',
          templateId: isMongoId ? new Types.ObjectId(template.id) : undefined,
          organizationName: trimmedOrgName,
          uploadedLogoPath: logoFile.path,
          finalImagePath: outputPath,
          imageWidth: template.width,
          imageHeight: template.height,
          status: 'COMPLETED',
        });
        generationId = doc._id.toString();
      } catch (dbErr) {
        console.warn('[GenerationController] MongoDB save failed, using memory store:', dbErr);
        generationId = new Types.ObjectId().toString();
        inMemoryGenerations.set(generationId, {
          id: generationId,
          generationMode: 'TEMPLATE',
          organizationName: trimmedOrgName,
          uploadedLogoPath: logoFile.path,
          finalImagePath: outputPath,
          imageWidth: template.width,
          imageHeight: template.height,
          status: 'COMPLETED',
          createdAt: new Date(),
        });
      }
    } else {
      generationId = new Types.ObjectId().toString();
      inMemoryGenerations.set(generationId, {
        id: generationId,
        generationMode: 'TEMPLATE',
        organizationName: trimmedOrgName,
        uploadedLogoPath: logoFile.path,
        finalImagePath: outputPath,
        imageWidth: template.width,
        imageHeight: template.height,
        status: 'COMPLETED',
        createdAt: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: generationId,
        generationMode: 'TEMPLATE',
        templateName: template.name,
        organizationName: trimmedOrgName,
        width: template.width,
        height: template.height,
        status: 'COMPLETED',
        previewUrl: `/api/generations/${generationId}/view`,
        downloadUrl: `/api/generations/${generationId}/download`,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const generateAiImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const logoFile = req.file;

  try {
    const { creativeIdea, organizationName, size, quality, style, brandingZone } = req.body;

    // 1. Validation
    if (!logoFile) {
      res.status(400).json({
        success: false,
        error: { message: 'Logo file is required (PNG or SVG format).' },
      });
      return;
    }

    if (!organizationName || typeof organizationName !== 'string' || organizationName.trim().length === 0) {
      if (fs.existsSync(logoFile.path)) fs.unlinkSync(logoFile.path);
      res.status(400).json({
        success: false,
        error: { message: 'Organization or authority name is required.' },
      });
      return;
    }

    if (organizationName.trim().length > 120) {
      if (fs.existsSync(logoFile.path)) fs.unlinkSync(logoFile.path);
      res.status(400).json({
        success: false,
        error: { message: 'Organization name cannot exceed 120 characters.' },
      });
      return;
    }

    let validatedIdea: string;
    try {
      validatedIdea = promptBuilder.validateIdea(creativeIdea);
    } catch (valErr: unknown) {
      if (fs.existsSync(logoFile.path)) fs.unlinkSync(logoFile.path);
      res.status(400).json({
        success: false,
        error: { message: valErr instanceof Error ? valErr.message : 'Invalid creative idea.' },
      });
      return;
    }

    // 2. Build structured prompt
    const promptData = promptBuilder.buildPrompt({
      creativeIdea: validatedIdea,
      style: style === 'natural' ? 'natural' : 'vivid',
      brandingZone: brandingZone === 'top' || brandingZone === 'center' ? brandingZone : 'bottom',
    });

    // 3. Call OpenAI Image API to synthesize background
    const validSizes: ImageSize[] = ['1024x1024', '1792x1024', '1024x1792'];
    const chosenSize: ImageSize = validSizes.includes(size) ? size : '1024x1024';

    const bgResult = await openaiImageService.generateBackground({
      prompt: promptData.structuredPrompt,
      size: chosenSize,
      quality: quality === 'hd' ? 'hd' : 'standard',
      style: style === 'natural' ? 'natural' : 'vivid',
      allowFallback: req.body.allowFallback === 'true',
    });

    // 4. Configure placements based on brandingZone and image dimensions
    const zone = promptData.brandingZone;
    let logoPlacement: { x: number; y: number; width: number; height: number; isNormalized: boolean };
    let textPlacement: { x: number; y: number; fontSize: number; fontColor: string; textAlign: 'left' | 'center' | 'right'; maxTextWidth: number; isNormalized: boolean };

    if (zone === 'top') {
      logoPlacement = { x: 0.06, y: 0.84, width: 0.16, height: 0.12, isNormalized: true };
      textPlacement = {
        x: 0.08,
        y: 0.10,
        fontSize: Math.round(bgResult.width * 0.038),
        fontColor: '#FFFFFF',
        textAlign: 'left',
        maxTextWidth: 0.84,
        isNormalized: true,
      };
    } else if (zone === 'center') {
      logoPlacement = { x: 0.40, y: 0.14, width: 0.20, height: 0.14, isNormalized: true };
      textPlacement = {
        x: 0.10,
        y: 0.82,
        fontSize: Math.round(bgResult.width * 0.040),
        fontColor: '#FFFFFF',
        textAlign: 'center',
        maxTextWidth: 0.80,
        isNormalized: true,
      };
    } else {
      // Default: bottom branding zone
      logoPlacement = { x: 0.06, y: 0.06, width: 0.16, height: 0.12, isNormalized: true };
      textPlacement = {
        x: 0.08,
        y: 0.86,
        fontSize: Math.round(bgResult.width * 0.038),
        fontColor: '#FFFFFF',
        textAlign: 'left',
        maxTextWidth: 0.84,
        isNormalized: true,
      };
    }

    // 5. Composite logo and organization name onto the AI background
    const randomHex = crypto.randomBytes(6).toString('hex');
    const outputFilename = `gen-ai-${Date.now()}-${randomHex}.png`;
    const outputPath = path.join(config.generatedDir, outputFilename);

    const trimmedOrgName = organizationName.trim();

    await imageCompositor.compositeTemplateImage({
      backgroundPath: bgResult.filePath,
      logoPath: logoFile.path,
      organizationName: trimmedOrgName,
      targetWidth: bgResult.width,
      targetHeight: bgResult.height,
      placements: {
        logo: logoPlacement,
        organizationName: textPlacement,
      },
      outputPath,
    });

    // 6. Persist metadata in MongoDB or in-memory store
    let generationId: string;

    if (dbStatus.isConnected) {
      try {
        const doc = await ImageGeneration.create({
          generationMode: 'AI',
          organizationName: trimmedOrgName,
          uploadedLogoPath: logoFile.path,
          originalCreativeIdea: validatedIdea,
          structuredPrompt: promptData.structuredPrompt,
          generatedBackgroundPath: bgResult.filePath,
          finalImagePath: outputPath,
          imageWidth: bgResult.width,
          imageHeight: bgResult.height,
          status: 'COMPLETED',
        });
        generationId = doc._id.toString();
      } catch (dbErr) {
        console.warn('[GenerationController] MongoDB save failed, using memory store:', dbErr);
        generationId = new Types.ObjectId().toString();
        inMemoryGenerations.set(generationId, {
          id: generationId,
          generationMode: 'AI',
          organizationName: trimmedOrgName,
          uploadedLogoPath: logoFile.path,
          originalCreativeIdea: validatedIdea,
          structuredPrompt: promptData.structuredPrompt,
          finalImagePath: outputPath,
          imageWidth: bgResult.width,
          imageHeight: bgResult.height,
          status: 'COMPLETED',
          createdAt: new Date(),
        });
      }
    } else {
      generationId = new Types.ObjectId().toString();
      inMemoryGenerations.set(generationId, {
        id: generationId,
        generationMode: 'AI',
        organizationName: trimmedOrgName,
        uploadedLogoPath: logoFile.path,
        originalCreativeIdea: validatedIdea,
        structuredPrompt: promptData.structuredPrompt,
        finalImagePath: outputPath,
        imageWidth: bgResult.width,
        imageHeight: bgResult.height,
        status: 'COMPLETED',
        createdAt: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: generationId,
        generationMode: 'AI',
        organizationName: trimmedOrgName,
        originalCreativeIdea: validatedIdea,
        structuredPrompt: promptData.structuredPrompt,
        width: bgResult.width,
        height: bgResult.height,
        status: 'COMPLETED',
        previewUrl: `/api/generations/${generationId}/view`,
        downloadUrl: `/api/generations/${generationId}/download`,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (logoFile && fs.existsSync(logoFile.path)) {
      try {
        fs.unlinkSync(logoFile.path);
      } catch {
        // ignore
      }
    }
    next(err);
  }
};

export const getGenerationById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    if (dbStatus.isConnected && Types.ObjectId.isValid(id)) {
      const doc = await ImageGeneration.findById(id).populate('templateId', 'name description');
      if (doc) {
        res.status(200).json({
          success: true,
          data: {
            id: doc._id.toString(),
            generationMode: doc.generationMode,
            organizationName: doc.organizationName,
            originalCreativeIdea: doc.originalCreativeIdea,
            structuredPrompt: doc.structuredPrompt,
            width: doc.imageWidth,
            height: doc.imageHeight,
            status: doc.status,
            previewUrl: `/api/generations/${doc._id.toString()}/view`,
            downloadUrl: `/api/generations/${doc._id.toString()}/download`,
            createdAt: doc.createdAt,
          },
        });
        return;
      }
    }

    // Check memory store
    const memDoc = inMemoryGenerations.get(id);
    if (memDoc) {
      res.status(200).json({
        success: true,
        data: {
          id: memDoc.id,
          generationMode: memDoc.generationMode,
          organizationName: memDoc.organizationName,
          originalCreativeIdea: memDoc.originalCreativeIdea,
          structuredPrompt: memDoc.structuredPrompt,
          width: memDoc.imageWidth,
          height: memDoc.imageHeight,
          status: memDoc.status,
          previewUrl: `/api/generations/${memDoc.id}/view`,
          downloadUrl: `/api/generations/${memDoc.id}/download`,
          createdAt: memDoc.createdAt,
        },
      });
      return;
    }

    res.status(404).json({
      success: false,
      error: { message: `Generation record not found with ID: ${id}` },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Streams the generated PNG image for in-browser preview
 */
export const viewGeneratedImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    let filePath: string | undefined;

    if (dbStatus.isConnected && Types.ObjectId.isValid(id)) {
      const doc = await ImageGeneration.findById(id);
      if (doc) filePath = doc.finalImagePath;
    }

    if (!filePath) {
      const memDoc = inMemoryGenerations.get(id);
      if (memDoc) filePath = memDoc.finalImagePath;
    }

    if (!filePath || !fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        error: { message: 'Generated image file not found on server.' },
      });
      return;
    }

    // Path traversal safety check
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(config.generatedDir))) {
      res.status(403).json({
        success: false,
        error: { message: 'Access denied: Invalid file path.' },
      });
      return;
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    fs.createReadStream(resolvedPath).pipe(res);
  } catch (err) {
    next(err);
  }
};

/**
 * Securely streams the generated PNG as an attachment download
 */
export const downloadGeneratedImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    let filePath: string | undefined;
    let orgName = 'team-connect';

    if (dbStatus.isConnected && Types.ObjectId.isValid(id)) {
      const doc = await ImageGeneration.findById(id);
      if (doc) {
        filePath = doc.finalImagePath;
        orgName = doc.organizationName;
      }
    }

    if (!filePath) {
      const memDoc = inMemoryGenerations.get(id);
      if (memDoc) {
        filePath = memDoc.finalImagePath;
        orgName = memDoc.organizationName || 'team-connect';
      }
    }

    if (!filePath || !fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        error: { message: 'Generated image file not found on server.' },
      });
      return;
    }

    // Path traversal safety check
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(config.generatedDir))) {
      res.status(403).json({
        success: false,
        error: { message: 'Access denied: Invalid file path.' },
      });
      return;
    }

    const sanitizedOrgName = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'image';

    const downloadFilename = `${sanitizedOrgName}-brand.png`;

    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${downloadFilename}"`
    );
    fs.createReadStream(resolvedPath).pipe(res);
  } catch (err) {
    next(err);
  }
};
