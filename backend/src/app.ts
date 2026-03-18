import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { env } from './lib/env.js';
import aiRouter, { legacyAiRouter } from './routes/ai.js';
import healthRouter from './routes/health.js';
import immunityRouter, { legacyImmunityRouter } from './routes/immunity.js';
import meRouter from './routes/me.js';
import reportsRouter, { legacyReportsRouter } from './routes/reports.js';

const app = new Hono();

const allowedOrigins =
  env.CORS_ORIGIN === '*'
    ? '*'
    : env.CORS_ORIGIN.split(',')
        .map(origin => origin.trim())
        .filter(Boolean);

app.use(
  '*',
  cors({
    origin: allowedOrigins,
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  })
);

app.route('/health', healthRouter);
app.route('/v1/me', meRouter);
app.route('/v1/immunity', immunityRouter);
app.route('/v1/reports', reportsRouter);
app.route('/v1/ai', aiRouter);

app.route('/api/auth', legacyImmunityRouter);
app.route('/api/auth', legacyReportsRouter);
app.route('/api/ai', legacyAiRouter);

app.notFound(c =>
  c.json(
    {
      success: false,
      message: 'Route not found',
    },
    404
  )
);

app.onError((error, c) => {
  console.error(error);

  const message =
    error instanceof Error ? error.message : 'Unexpected server error';

  return c.json(
    {
      success: false,
      message,
    },
    500
  );
});

export { app };
export default app;
