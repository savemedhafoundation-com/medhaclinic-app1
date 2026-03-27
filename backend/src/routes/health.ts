import { Hono } from 'hono';

import {
  env,
  getDatabaseHost,
  getFirebaseAdminCredentialSource,
  getFirebaseAdminProjectId,
  hasFirebaseAdminConfig,
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

  return 'Database health check failed.';
}

healthRouter.get('/', async c => {
  let databaseReachable = true;
  let databaseMessage: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    databaseReachable = false;
    databaseMessage = getDatabaseHealthMessage(error);
  }

  return c.json({
    success: true,
    service: 'medhaclinic-backend',
    status: 'ok',
    timestamp: new Date().toISOString(),
    firebaseAdminConfigured: hasFirebaseAdminConfig(),
    firebaseAdminCredentialSource: getFirebaseAdminCredentialSource(),
    firebaseAdminProjectId: getFirebaseAdminProjectId(),
    openaiConfigured: Boolean(env.OPENAI_API_KEY),
    databaseHost: getDatabaseHost(),
    databaseReachable,
    databaseMessage,
  });
});

export default healthRouter;
