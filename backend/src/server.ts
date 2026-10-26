import { createApp } from './app';
import { config } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';
import { templateService } from './services/template.service';

const startServer = async () => {
  // Attempt database connection (non-blocking so server can start and report status)
  await connectDatabase();

  // Ensure default template assets exist on disk and seed DB if connected
  await templateService.seedDatabaseIfConnected();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`===============================================`);
    console.log(`🚀 Team Connect Backend Server Running`);
    console.log(`📡 Environment: ${config.nodeEnv}`);
    console.log(`🌐 Port: ${config.port}`);
    console.log(`🔗 Health Check: http://localhost:${config.port}/api/health`);
    console.log(`===============================================`);
  });

  const handleShutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await disconnectDatabase();
      console.log('[Server] Cleanup complete. Exiting.');
      process.exit(0);
    });

    // Force exit if shutdown hangs
    setTimeout(() => {
      console.error('[Server] Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
};

startServer().catch((err) => {
  console.error('[Server] Fatal error starting server:', err);
  process.exit(1);
});
