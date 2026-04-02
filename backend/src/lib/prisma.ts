import { PrismaClient } from '@prisma/client';

import { env } from './env.js';

declare global {
  var __medhaPrisma__: PrismaClient | undefined;
}

export const prisma =
  global.__medhaPrisma__ ??
  new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__medhaPrisma__ = prisma;
}
