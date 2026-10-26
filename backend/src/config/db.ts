import mongoose from 'mongoose';
import { config } from './env';

interface DatabaseStatus {
  isConnected: boolean;
  state: 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'uninitialized';
  host?: string;
  name?: string;
  lastError?: string;
}

export const dbStatus: DatabaseStatus = {
  isConnected: false,
  state: 'uninitialized',
};

export const connectDatabase = async (): Promise<boolean> => {
  if (!config.mongoUri) {
    console.warn('[Database] MONGODB_URI is not defined. Running without active database connection.');
    dbStatus.state = 'disconnected';
    dbStatus.lastError = 'MONGODB_URI is not defined';
    return false;
  }

  try {
    dbStatus.state = 'connecting';
    console.log(`[Database] Connecting to MongoDB...`);

    mongoose.connection.on('connected', () => {
      dbStatus.isConnected = true;
      dbStatus.state = 'connected';
      dbStatus.host = mongoose.connection.host;
      dbStatus.name = mongoose.connection.name;
      dbStatus.lastError = undefined;
      console.log(`[Database] MongoDB connected successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      dbStatus.isConnected = false;
      dbStatus.state = 'disconnected';
      dbStatus.lastError = err.message;
      console.error('[Database] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      dbStatus.isConnected = false;
      dbStatus.state = 'disconnected';
      console.warn('[Database] MongoDB disconnected.');
    });

    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    dbStatus.isConnected = true;
    dbStatus.state = 'connected';
    dbStatus.host = mongoose.connection.host;
    dbStatus.name = mongoose.connection.name;
    return true;
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    dbStatus.isConnected = false;
    dbStatus.state = 'disconnected';
    dbStatus.lastError = errorMsg;
    console.warn(`[Database] MongoDB connection could not be established: ${errorMsg}`);
    console.warn('[Database] The application will continue running. Update MONGODB_URI in backend/.env when ready.');
    return false;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    dbStatus.isConnected = false;
    dbStatus.state = 'disconnected';
    console.log('[Database] MongoDB disconnected gracefully.');
  }
};
