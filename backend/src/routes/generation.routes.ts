import { Router } from 'express';
import { uploadLogo } from '../middleware/upload.middleware';
import {
  generateTemplateImage,
  generateAiImage,
  getGenerationById,
  viewGeneratedImage,
  downloadGeneratedImage,
} from '../controllers/generation.controller';
import {
  generationRateLimiter,
  validateUploadedLogo,
  sanitizeInputs,
} from '../middleware/security.middleware';

const router = Router();

// POST /api/generations/template (Uploads logo & composites on template with security validation)
router.post(
  '/template',
  generationRateLimiter,
  uploadLogo.single('logo'),
  validateUploadedLogo,
  sanitizeInputs,
  generateTemplateImage
);

// POST /api/generations/ai (Synthesizes background with Free AI Studio & composites logo/text)
router.post(
  '/ai',
  generationRateLimiter,
  uploadLogo.single('logo'),
  validateUploadedLogo,
  sanitizeInputs,
  generateAiImage
);

// GET /api/generations/:id (Metadata)
router.get('/:id', getGenerationById);

// GET /api/generations/:id/view (Image stream for preview)
router.get('/:id/view', viewGeneratedImage);

// GET /api/generations/:id/download (Attachment download)
router.get('/:id/download', downloadGeneratedImage);

export default router;
