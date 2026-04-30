import { PrismaClient } from '@prisma/client';

import { env } from './env.js';

declare global {
  var __medhaPrisma__: PrismaClient | undefined;
}

function createMissingDatabaseConfigurationError() {
  return new Error(
    'Database configuration is missing. Set DATABASE_URL for Neon or another hosted Postgres database, or provide DB_USER, DB_PASS, DB_NAME, and DB_HOST.'
  );
}

function createPrismaClient() {
  if (!env.DATABASE_URL) {
    throw createMissingDatabaseConfigurationError();
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: getPrismaDatabaseUrl(env.DATABASE_URL),
      },
    },
    log: ['warn', 'error'],
  });
}

function getPrismaDatabaseUrl(databaseUrl: string) {
  if (process.env.VERCEL !== '1') {
    return databaseUrl;
  }

  try {
    const url = new URL(databaseUrl);

    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', '1');
    }

    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', '10');
    }

    return url.toString();
  } catch {
    return databaseUrl;
  }
}

export function getPrismaClient() {
  if (global.__medhaPrisma__) {
    return global.__medhaPrisma__;
  }

  const client = createPrismaClient();
  global.__medhaPrisma__ = client;

  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, receiver);

    return typeof value === 'function' ? value.bind(client) : value;
  },
});
