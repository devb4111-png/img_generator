import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { templateService } from '../services/template.service';
import { Template } from '../models/Template';
import { dbStatus } from '../config/db';
import { isSafeFilename } from '../middleware/security.middleware';

const TEMPLATES_DIR = path.resolve(process.cwd(), 'templates');

// Helper to check admin authorization for privileged template modifications
const verifyAdminAccess = (req: Request): boolean => {
  const adminSecret = req.headers['x-admin-secret'] || req.query.admin_secret;
  const configuredSecret = process.env.ADMIN_SECRET || 'team_connect_admin_secret_2025';
  return adminSecret === configuredSecret;
};

export const listTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const templates = await templateService.getActiveTemplates();
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (err) {
    next(err);
  }
};

export const getTemplateById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const template = await templateService.getTemplateById(id);

    if (!template) {
      res.status(404).json({
        success: false,
        error: { message: `Template not found with ID: ${id}` },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (err) {
    next(err);
  }
};

export const createTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!verifyAdminAccess(req)) {
      res.status(403).json({
        success: false,
        error: { message: 'Forbidden: Admin authorization required to create templates.' },
      });
      return;
    }

    if (!dbStatus.isConnected) {
      res.status(503).json({
        success: false,
        error: { message: 'Database connection required to persist new templates.' },
      });
      return;
    }

    const { name, description, previewImagePath, backgroundImagePath, width, height, placements } = req.body;

    if (!name || !previewImagePath || !backgroundImagePath || !width || !height || !placements) {
      res.status(400).json({
        success: false,
        error: { message: 'Missing required template fields.' },
      });
      return;
    }

    const created = await Template.create({
      name,
      description,
      previewImagePath,
      backgroundImagePath,
      width,
      height,
      placements,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!verifyAdminAccess(req)) {
      res.status(403).json({
        success: false,
        error: { message: 'Forbidden: Admin authorization required to modify templates.' },
      });
      return;
    }

    if (!dbStatus.isConnected) {
      res.status(503).json({
        success: false,
        error: { message: 'Database connection required to update templates.' },
      });
      return;
    }

    const { id } = req.params as { id: string };
    const updated = await Template.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) {
      res.status(404).json({
        success: false,
        error: { message: `Template not found with ID: ${id}` },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Safely serves template asset previews and backgrounds with path traversal protection
 */
export const getTemplateAsset = (req: Request, res: Response): void => {
  const { filename } = req.params as { filename: string };

  // Prevent path traversal
  if (!isSafeFilename(filename)) {
    res.status(400).json({
      success: false,
      error: { message: 'Invalid asset filename: path traversal blocked.' },
    });
    return;
  }

  const safeFilename = path.basename(filename);
  const filePath = path.join(TEMPLATES_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({
      success: false,
      error: { message: 'Asset not found' },
    });
    return;
  }

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  fs.createReadStream(filePath).pipe(res);
};
