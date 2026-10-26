import { Request, Response } from 'express';
import fs from 'fs';
import { config } from '../config/env';
import { dbStatus } from '../config/db';

export const getHealth = (req: Request, res: Response): void => {
  const uploadsExist = fs.existsSync(config.uploadDir);
  const generatedExist = fs.existsSync(config.generatedDir);

  const healthData = {
    status: 'ok',
    service: 'Team Connect Image Generator Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.nodeEnv,
    database: {
      connected: dbStatus.isConnected,
      state: dbStatus.state,
      host: dbStatus.host || null,
      name: dbStatus.name || null,
      ...(dbStatus.lastError ? { error: dbStatus.lastError } : {}),
    },
    storage: {
      uploadsReady: uploadsExist,
      generatedReady: generatedExist,
    },
  };

  res.status(200).json(healthData);
};
