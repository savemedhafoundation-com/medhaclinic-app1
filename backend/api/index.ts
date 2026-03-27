import { handle } from '@hono/node-server/vercel';

import app from '../src/app.js';

export const config = { runtime: 'nodejs', maxDuration: 60 };
export default handle(app);
