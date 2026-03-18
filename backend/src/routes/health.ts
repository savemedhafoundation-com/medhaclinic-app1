import { Hono } from 'hono';

import { env, hasFirebaseAdminConfig } from '../lib/env.js';

const healthRouter = new Hono();

healthRouter.get('/', c =>
  c.json({
    success: true,
    service: 'medhaclinic-backend',
    status: 'ok',
    timestamp: new Date().toISOString(),
    firebaseAdminConfigured: hasFirebaseAdminConfig(),
    openaiConfigured: Boolean(env.OPENAI_API_KEY),
  })
);

export default healthRouter;
