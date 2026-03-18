import { PrismaClient } from '@prisma/client';

declare global {
  var __medhaPrisma__: PrismaClient | undefined;
}

export const prisma =
  global.__medhaPrisma__ ??
  new PrismaClient({
    log: ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__medhaPrisma__ = prisma;
}
