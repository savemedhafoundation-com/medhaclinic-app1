import { Hono } from 'hono';

import {
  env,
  getDatabaseConnectionMode,
  getDatabaseHost,
  getDatabaseSocketPath,
  getFirebaseAdminCredentialSource,
  getFirebaseAdminProjectId,
  getGoogleCloudProjectId,
  getInstanceConnectionName,
  hasDatabaseConfig,
  hasFirebaseAdminConfig,
  hasGoogleCloudRuntime,
} from '../lib/env.js';
import { prisma } from '../lib/prisma.js';

const healthRouter = new Hono();

function getDatabaseHealthMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return 'Database health check failed.';
  }

  const message = error.message.toLowerCase();

  if (message.includes("can't reach database server")) {
    return 'Database is unreachable.';
  }

  if (message.includes('authentication failed')) {
    return 'Database authentication failed.';
  }

  if (message.includes('tls') || message.includes('ssl')) {
    return 'Database SSL negotiation failed.';
  }

  if (message.includes('database configuration is missing')) {
    return 'Database configuration is missing.';
  }

  return 'Database health check failed.';
}

healthRouter.get('/', async c => {
  let databaseReachable = hasDatabaseConfig();
  let databaseMessage: string | null = null;

  if (!hasDatabaseConfig()) {
    databaseMessage = 'Database configuration is missing.';
  } else {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      databaseReachable = false;
      databaseMessage = getDatabaseHealthMessage(error);
    }
  }

  return c.json({
    success: true,
    service: 'medhaclinic-backend',
    status: 'ok',
    timestamp: new Date().toISOString(),
    firebaseAdminConfigured: hasFirebaseAdminConfig(),
    firebaseAdminCredentialSource: getFirebaseAdminCredentialSource(),
    firebaseAdminProjectId: getFirebaseAdminProjectId(),
    googleCloudRuntime: hasGoogleCloudRuntime(),
    googleCloudProjectId: getGoogleCloudProjectId(),
    openaiConfigured: Boolean(env.OPENAI_API_KEY),
    databaseHost: getDatabaseHost(),
    databaseConnectionMode: getDatabaseConnectionMode(),
    databaseSocketPath: getDatabaseSocketPath(),
    instanceConnectionName: getInstanceConnectionName(),
    databaseReachable,
    databaseMessage,
  });
});

export default healthRouter;
