import { serve } from '@hono/node-server';

import { app } from './app.js';
import { env } from './lib/env.js';

serve(
  {
    fetch: app.fetch,
    hostname: '0.0.0.0',
    port: env.PORT,
  },
  info => {
    console.log(`MedhaClinic backend listening on http://0.0.0.0:${info.port}`);
  }
);
