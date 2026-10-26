import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';
import { config } from '../config/env';

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = ['image/png', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = ['.png', '.svg'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(8).toString('hex');
    const uniqueFilename = `logo-${Date.now()}-${randomHex}${ext}`;
    cb(null, uniqueFilename);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error(
        `Invalid file format: ${file.mimetype}. Only PNG and SVG logos are supported.`
      )
    );
  }
  cb(null, true);
};

export const uploadLogo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxUploadSizeMb * 1024 * 1024, // e.g. 5MB
    files: 1,
  },
});
