import { config } from 'dotenv';
import { z } from 'zod';

const isProductionRuntime =
  process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

if (!isProductionRuntime) {
  config();
}

function readTrimmedEnv(name: string) {
  return process.env[name]?.trim();
}

function readTrimmedMultilineEnv(name: string) {
  return process.env[name]?.replace(/\\n/g, '\n').trim();
}

function validateDatabaseUrl(databaseUrl?: string) {
  if (!databaseUrl || !isProductionRuntime) {
    return databaseUrl;
  }

  try {
    const hostname = new URL(databaseUrl).hostname.toLowerCase();

    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1'
    ) {
      throw new Error(
        'DATABASE_URL points to localhost in production. Set the Vercel DATABASE_URL environment variable to your hosted Postgres connection string.'
      );
    }
  } catch (error) {
    if (error instanceof TypeError) {
      return databaseUrl;
    }

    throw error;
  }

  return databaseUrl;
}

const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('*'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
});

const parsed = baseEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CORS_ORIGIN: readTrimmedEnv('CORS_ORIGIN'),
  DATABASE_URL: validateDatabaseUrl(readTrimmedEnv('DATABASE_URL')),
  OPENAI_API_KEY: readTrimmedEnv('OPENAI_API_KEY'),
  OPENAI_MODEL: readTrimmedEnv('OPENAI_MODEL'),
  FIREBASE_PROJECT_ID: readTrimmedEnv('FIREBASE_PROJECT_ID'),
  FIREBASE_CLIENT_EMAIL: readTrimmedEnv('FIREBASE_CLIENT_EMAIL'),
  FIREBASE_PRIVATE_KEY: readTrimmedMultilineEnv('FIREBASE_PRIVATE_KEY'),
  FIREBASE_SERVICE_ACCOUNT_JSON: readTrimmedEnv('FIREBASE_SERVICE_ACCOUNT_JSON'),
  GOOGLE_APPLICATION_CREDENTIALS: readTrimmedEnv('GOOGLE_APPLICATION_CREDENTIALS'),
});

const hasJsonCredential = !!parsed.FIREBASE_SERVICE_ACCOUNT_JSON;
const hasSplitCredential =
  !!parsed.FIREBASE_PROJECT_ID &&
  !!parsed.FIREBASE_CLIENT_EMAIL &&
  !!parsed.FIREBASE_PRIVATE_KEY;
const hasCredentialFile = !!parsed.GOOGLE_APPLICATION_CREDENTIALS;

type FirebaseAdminCredentialSource = 'service_account_json' | 'split_env' | 'credential_file' | 'none';

export function hasFirebaseAdminConfig() {
  return hasJsonCredential || hasSplitCredential || hasCredentialFile;
}

export function getFirebaseAdminCredentialSource(): FirebaseAdminCredentialSource {
  if (hasJsonCredential) {
    return 'service_account_json';
  }

  if (hasSplitCredential) {
    return 'split_env';
  }

  if (hasCredentialFile) {
    return 'credential_file';
  }

  return 'none';
}

export function getFirebaseAdminProjectId() {
  if (parsed.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount = JSON.parse(parsed.FIREBASE_SERVICE_ACCOUNT_JSON) as {
        project_id?: string;
        projectId?: string;
      };

      return serviceAccount.projectId ?? serviceAccount.project_id ?? null;
    } catch {
      return null;
    }
  }

  if (parsed.FIREBASE_PROJECT_ID) {
    return parsed.FIREBASE_PROJECT_ID;
  }

  return null;
}

export function getDatabaseHost() {
  try {
    return new URL(parsed.DATABASE_URL).hostname;
  } catch {
    return null;
  }
}

export const env = parsed;
