import type { Prisma } from '@prisma/client';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { Context, MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';

import { getAdminAuth } from '../lib/firebase-admin.js';
import { prisma } from '../lib/prisma.js';

export type AuthVariables = {
  firebaseUser: DecodedIdToken;
  dbUser: Prisma.UserGetPayload<Record<string, never>>;
};

export type AuthEnv = {
  Variables: AuthVariables;
};

function getBearerToken(c: Context) {
  const header = c.req.header('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export const requireAuth: MiddlewareHandler<AuthEnv> = createMiddleware(
  async (c, next) => {
    const token = getBearerToken(c);

    if (!token) {
      return c.json(
        {
          success: false,
          message: 'Missing Authorization bearer token.',
        },
        401
      );
    }

    let adminAuth;

    try {
      adminAuth = getAdminAuth();
    } catch (error) {
      console.error('Firebase auth bootstrap failed:', error);

      return c.json(
        {
          success: false,
          message:
            'Backend auth is not configured. Add Firebase Admin credentials to the backend .env file.',
        },
        500
      );
    }

    try {
      const decoded = await adminAuth.verifyIdToken(token);
      const provider =
        typeof decoded.firebase?.sign_in_provider === 'string'
          ? decoded.firebase.sign_in_provider
          : undefined;

      const dbUser = await prisma.user.upsert({
        where: {
          firebaseUid: decoded.uid,
        },
        update: {
          email: decoded.email ?? undefined,
          name: decoded.name ?? undefined,
          photoUrl: decoded.picture ?? undefined,
          provider,
        },
        create: {
          firebaseUid: decoded.uid,
          email: decoded.email ?? undefined,
          name: decoded.name ?? undefined,
          photoUrl: decoded.picture ?? undefined,
          provider,
        },
      });

      c.set('firebaseUser', decoded);
      c.set('dbUser', dbUser);

      await next();
    } catch (error) {
      console.error('Firebase auth verification failed:', error);

      return c.json(
        {
          success: false,
          message:
            'Invalid or expired Firebase token. If this keeps happening after signing in again, verify that the backend Firebase Admin project matches the app Firebase project.',
        },
        401
      );
    }
  }
);
