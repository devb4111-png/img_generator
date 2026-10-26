import { Router } from 'express';
import {
  listTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  getTemplateAsset,
} from '../controllers/template.controller';

const router = Router();

// Public: Serve template preview and background assets
router.get('/assets/:filename', getTemplateAsset);

// Public: List all active templates
router.get('/', listTemplates);

// Public: Get template by ID
router.get('/:id', getTemplateById);

// Restricted: Create template (requires admin secret)
router.post('/', createTemplate);

// Restricted: Update template (requires admin secret)
router.patch('/:id', updateTemplate);

export default router;
