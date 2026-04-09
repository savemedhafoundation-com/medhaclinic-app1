import type { Prisma } from '@prisma/client';
import { Prisma as PrismaNamespace } from '@prisma/client';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { Context, MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';

import { getFirebaseAdminProjectId } from '../lib/env.js';
import { getAdminAuth } from '../lib/firebase-admin.js';
import { prisma } from '../lib/prisma.js';

export type VerifiedAuthVariables = {
  firebaseUser: DecodedIdToken;
};

export type VerifiedAuthEnv = {
  Variables: VerifiedAuthVariables;
};

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

function decodeJwtPayload(token: string) {
  const payload = token.split('.')[1];

  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '='
    );

    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as {
      aud?: unknown;
      iss?: unknown;
    };
  } catch {
    return null;
  }
}

function getTokenProjectId(token: string) {
  const claims = decodeJwtPayload(token);

  if (!claims) {
    return null;
  }

  if (typeof claims.aud === 'string' && claims.aud.trim()) {
    return claims.aud;
  }

  if (typeof claims.iss === 'string') {
    const match = claims.iss.match(/^https:\/\/securetoken\.google\.com\/(.+)$/);
    return match?.[1] ?? null;
  }

  return null;
}

function getFirebaseAuthErrorCode(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }

  return null;
}

function buildFirebaseAuthFailureMessage(error: unknown) {
  const errorCode = getFirebaseAuthErrorCode(error);

  switch (errorCode) {
    case 'auth/id-token-expired':
      return 'Firebase ID token expired. Sign out and sign in again to refresh the session.';
    case 'auth/id-token-revoked':
      return 'Firebase ID token was revoked. Sign out and sign in again.';
    case 'auth/invalid-id-token':
      return 'Firebase ID token is malformed or invalid. The app may be sending a stale or mismatched session token.';
    case 'auth/invalid-credential':
      return 'Firebase Admin credentials are not valid for ID token verification. Recheck the backend Firebase Admin configuration or deployed service credentials.';
    case 'auth/project-not-found':
      return 'Firebase Admin is pointing at a project that does not exist or is not accessible.';
    case 'auth/argument-error':
      return 'Firebase token verification failed because the bearer token format or backend credential input is invalid.';
    default:
      return 'Invalid or expired Firebase token. If this keeps happening after signing in again, verify that the backend Firebase Admin project matches the app Firebase project.';
  }
}

function buildDatabaseFailureMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (message.includes("can't reach database server")) {
    return 'Database is unreachable. Verify the production database configuration, hosted Postgres connection, and network settings.';
  }

  if (message.includes('authentication failed')) {
    return 'Database authentication failed. Recheck the production database user and password.';
  }

  if (message.includes('tls') || message.includes('ssl')) {
    return 'Database SSL negotiation failed. Verify the production database SSL configuration.';
  }

  return 'Database is not configured correctly or is currently unreachable. Check the backend database configuration and Prisma migration state.';
}

function isPrismaInitializationError(error: unknown) {
  return error instanceof PrismaNamespace.PrismaClientInitializationError;
}

function getSignInProvider(decoded: DecodedIdToken) {
  return typeof decoded.firebase?.sign_in_provider === 'string'
    ? decoded.firebase.sign_in_provider
    : undefined;
}

export async function upsertDbUserFromFirebaseUser(decoded: DecodedIdToken) {
  const provider = getSignInProvider(decoded);

  return prisma.user.upsert({
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
}

function handleFirebaseVerificationFailure(
  c: Context,
  token: string,
  error: unknown
) {
  const adminProjectId = getFirebaseAdminProjectId();
  const tokenProjectId = getTokenProjectId(token);
  const errorCode = getFirebaseAuthErrorCode(error);

  console.error('Firebase auth verification failed:', {
    error,
    errorCode,
    tokenProjectId,
    adminProjectId,
  });

  if (
    tokenProjectId &&
    adminProjectId &&
    tokenProjectId !== adminProjectId
  ) {
        return c.json(
          {
            success: false,
            message: `Firebase token project mismatch. The app token is for "${tokenProjectId}" but the backend is configured for "${adminProjectId}". Update the backend Firebase Admin configuration to the same Firebase project as the app.`,
          },
          401
        );
  }

  return c.json(
    {
      success: false,
      message: buildFirebaseAuthFailureMessage(error),
      errorCode,
    },
    401
  );
}

export const requireVerifiedAuth: MiddlewareHandler<VerifiedAuthEnv> =
  createMiddleware(async (c, next) => {
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
      c.set('firebaseUser', decoded);
      await next();
    } catch (error) {
      return handleFirebaseVerificationFailure(c, token, error);
    }
  });

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
      c.set('firebaseUser', decoded);
      try {
        const dbUser = await upsertDbUserFromFirebaseUser(decoded);
        c.set('dbUser', dbUser);
        await next();
      } catch (error) {
        console.error('Database user sync failed after Firebase verification:', {
          error,
          firebaseUid: decoded.uid,
          isInitializationError: isPrismaInitializationError(error),
        });

        return c.json(
          {
            success: false,
            message: buildDatabaseFailureMessage(error),
          },
          503
        );
      }
    } catch (error) {
      return handleFirebaseVerificationFailure(c, token, error);
    }
  }
);
