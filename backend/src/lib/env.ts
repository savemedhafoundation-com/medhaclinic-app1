import { config } from 'dotenv';
import { z } from 'zod';

config();

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
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  DATABASE_URL: process.env.DATABASE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
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

export const env = parsed;
