import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  frontendUrl: string;
  uploadDir: string;
  generatedDir: string;
  maxUploadSizeMb: number;
  aiProvider: string;
  aiHordeApiKey: string;
  geminiApiKey?: string;
  geminiImageModel?: string;
  enableAiFallback: boolean;
  openaiApiKey?: string;
  openaiImageModel?: string;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/team_connect',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
  generatedDir: path.resolve(process.cwd(), process.env.GENERATED_DIR || 'generated'),
  maxUploadSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '5', 10),
  aiProvider: (process.env.AI_PROVIDER || 'free').toLowerCase(),
  aiHordeApiKey: process.env.AI_HORDE_API_KEY || '0000000000',
  geminiApiKey: process.env.GEMINI_API_KEY || undefined,
  geminiImageModel: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
  enableAiFallback: process.env.ENABLE_AI_FALLBACK === 'true' || true,
  openaiApiKey: process.env.OPENAI_API_KEY || undefined,
  openaiImageModel: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1-mini',
};
