import { config } from 'dotenv';
import { z } from 'zod';

const isGoogleCloudRuntime = Boolean(
  process.env.K_SERVICE ||
    process.env.CLOUD_RUN_JOB ||
    process.env.FUNCTION_TARGET ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_PROJECT
);

const isProductionRuntime =
  process.env.NODE_ENV === 'production' ||
  process.env.VERCEL === '1' ||
  isGoogleCloudRuntime;

if (!isProductionRuntime) {
  config();
}

function readTrimmedEnv(name: string) {
  return process.env[name]?.trim();
}

function readTrimmedMultilineEnv(name: string) {
  return process.env[name]?.replace(/\\n/g, '\n').trim();
}

type DatabaseConnectionMode = 'url' | 'socket' | 'tcp' | 'unknown';

type ResolvedDatabaseConfig = {
  url: string | null;
  host: string | null;
  mode: DatabaseConnectionMode;
  socketPath: string | null;
};

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('*'),
  DATABASE_URL: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASS: z.string().optional(),
  DB_NAME: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_SCHEMA: z.string().default('public'),
  DB_SOCKET_DIR: z.string().default('/cloudsql'),
  INSTANCE_CONNECTION_NAME: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GOOGLE_CLOUD_PROJECT: z.string().optional(),
  GCLOUD_PROJECT: z.string().optional(),
  GCP_PROJECT: z.string().optional(),
});

type RawEnv = z.infer<typeof rawEnvSchema>;

function getGoogleCloudProjectIdFromRawEnv(rawEnv: RawEnv) {
  return (
    rawEnv.GOOGLE_CLOUD_PROJECT ??
    rawEnv.GCLOUD_PROJECT ??
    rawEnv.GCP_PROJECT ??
    rawEnv.FIREBASE_PROJECT_ID ??
    null
  );
}

function buildDatabaseUrl({
  user,
  password,
  database,
  host,
  port,
  schema,
  extraSearchParams = {},
}: {
  user: string;
  password: string;
  database: string;
  host: string;
  port: number;
  schema: string;
  extraSearchParams?: Record<string, string>;
}) {
  const databaseUrl = new URL('postgresql://localhost');
  databaseUrl.username = user;
  databaseUrl.password = password;
  databaseUrl.hostname = host;
  databaseUrl.port = String(port);
  databaseUrl.pathname = `/${database}`;
  databaseUrl.searchParams.set('schema', schema);

  for (const [key, value] of Object.entries(extraSearchParams)) {
    if (value) {
      databaseUrl.searchParams.set(key, value);
    }
  }

  return databaseUrl.toString();
}

function buildDatabaseSocketPath(rawEnv: RawEnv) {
  if (!rawEnv.INSTANCE_CONNECTION_NAME) {
    return null;
  }

  return `${rawEnv.DB_SOCKET_DIR.replace(/\/+$/, '')}/${rawEnv.INSTANCE_CONNECTION_NAME}`;
}

function resolveDatabaseConfig(rawEnv: RawEnv): ResolvedDatabaseConfig {
  if (rawEnv.DATABASE_URL) {
    try {
      const parsedDatabaseUrl = new URL(rawEnv.DATABASE_URL);
      const socketPath = parsedDatabaseUrl.searchParams.get('host');

      return {
        url: rawEnv.DATABASE_URL,
        host: socketPath || parsedDatabaseUrl.hostname || null,
        mode: socketPath ? 'socket' : 'url',
        socketPath,
      };
    } catch {
      return {
        url: rawEnv.DATABASE_URL,
        host: null,
        mode: 'url',
        socketPath: null,
      };
    }
  }

  if (rawEnv.DB_USER && rawEnv.DB_PASS && rawEnv.DB_NAME) {
    const socketPath = buildDatabaseSocketPath(rawEnv);

    if (socketPath) {
      return {
        url: buildDatabaseUrl({
          user: rawEnv.DB_USER,
          password: rawEnv.DB_PASS,
          database: rawEnv.DB_NAME,
          host: 'localhost',
          port: rawEnv.DB_PORT,
          schema: rawEnv.DB_SCHEMA,
          extraSearchParams: {
            host: socketPath,
          },
        }),
        host: socketPath,
        mode: 'socket',
        socketPath,
      };
    }

    if (rawEnv.DB_HOST) {
      return {
        url: buildDatabaseUrl({
          user: rawEnv.DB_USER,
          password: rawEnv.DB_PASS,
          database: rawEnv.DB_NAME,
          host: rawEnv.DB_HOST,
          port: rawEnv.DB_PORT,
          schema: rawEnv.DB_SCHEMA,
        }),
        host: rawEnv.DB_HOST,
        mode: 'tcp',
        socketPath: null,
      };
    }
  }

  return {
    url: null,
    host: null,
    mode: 'unknown',
    socketPath: null,
  };
}

function validateResolvedDatabaseConfig(databaseConfig: ResolvedDatabaseConfig) {
  if (!databaseConfig.url) {
    return;
  }

  if (!isProductionRuntime || !databaseConfig.host) {
    return;
  }

  if (databaseConfig.mode === 'socket') {
    return;
  }

  try {
    const hostname = databaseConfig.host.toLowerCase();

    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1'
    ) {
      throw new Error(
        'Resolved database configuration points to localhost in production. Use Cloud SQL socket configuration or a hosted Postgres connection string instead.'
      );
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }
  }
}

const rawEnv = rawEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CORS_ORIGIN: readTrimmedEnv('CORS_ORIGIN'),
  DATABASE_URL: readTrimmedEnv('DATABASE_URL'),
  DB_USER: readTrimmedEnv('DB_USER'),
  DB_PASS: readTrimmedEnv('DB_PASS'),
  DB_NAME: readTrimmedEnv('DB_NAME'),
  DB_HOST: readTrimmedEnv('DB_HOST'),
  DB_PORT: process.env.DB_PORT,
  DB_SCHEMA: readTrimmedEnv('DB_SCHEMA'),
  DB_SOCKET_DIR: readTrimmedEnv('DB_SOCKET_DIR'),
  INSTANCE_CONNECTION_NAME: readTrimmedEnv('INSTANCE_CONNECTION_NAME'),
  OPENAI_API_KEY: readTrimmedEnv('OPENAI_API_KEY'),
  OPENAI_MODEL: readTrimmedEnv('OPENAI_MODEL'),
  FIREBASE_PROJECT_ID: readTrimmedEnv('FIREBASE_PROJECT_ID'),
  FIREBASE_CLIENT_EMAIL: readTrimmedEnv('FIREBASE_CLIENT_EMAIL'),
  FIREBASE_PRIVATE_KEY: readTrimmedMultilineEnv('FIREBASE_PRIVATE_KEY'),
  FIREBASE_SERVICE_ACCOUNT_JSON: readTrimmedEnv('FIREBASE_SERVICE_ACCOUNT_JSON'),
  GOOGLE_APPLICATION_CREDENTIALS: readTrimmedEnv('GOOGLE_APPLICATION_CREDENTIALS'),
  GOOGLE_CLOUD_PROJECT: readTrimmedEnv('GOOGLE_CLOUD_PROJECT'),
  GCLOUD_PROJECT: readTrimmedEnv('GCLOUD_PROJECT'),
  GCP_PROJECT: readTrimmedEnv('GCP_PROJECT'),
});

const resolvedDatabaseConfig = resolveDatabaseConfig(rawEnv);
validateResolvedDatabaseConfig(resolvedDatabaseConfig);

const finalEnvSchema = rawEnvSchema.extend({
  DATABASE_URL: z.string().min(1).optional(),
  GOOGLE_CLOUD_PROJECT: z.string().optional(),
});

const parsed = finalEnvSchema.parse({
  ...rawEnv,
  DATABASE_URL: resolvedDatabaseConfig.url ?? undefined,
  GOOGLE_CLOUD_PROJECT:
    rawEnv.GOOGLE_CLOUD_PROJECT ?? getGoogleCloudProjectIdFromRawEnv(rawEnv) ?? undefined,
});

if (parsed.DATABASE_URL) {
  process.env.DATABASE_URL = parsed.DATABASE_URL;
}

const hasJsonCredential = !!parsed.FIREBASE_SERVICE_ACCOUNT_JSON;
const hasSplitCredential =
  !!parsed.FIREBASE_PROJECT_ID &&
  !!parsed.FIREBASE_CLIENT_EMAIL &&
  !!parsed.FIREBASE_PRIVATE_KEY;
const hasCredentialFile = !!parsed.GOOGLE_APPLICATION_CREDENTIALS;
const hasApplicationDefaultCredentials = isGoogleCloudRuntime;

type FirebaseAdminCredentialSource =
  | 'service_account_json'
  | 'split_env'
  | 'credential_file'
  | 'application_default_credentials'
  | 'none';

export function hasFirebaseAdminConfig() {
  return (
    hasJsonCredential ||
    hasSplitCredential ||
    hasCredentialFile ||
    hasApplicationDefaultCredentials
  );
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

  if (hasApplicationDefaultCredentials) {
    return 'application_default_credentials';
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

  if (parsed.GOOGLE_CLOUD_PROJECT) {
    return parsed.GOOGLE_CLOUD_PROJECT;
  }

  return null;
}

export function hasGoogleCloudRuntime() {
  return isGoogleCloudRuntime;
}

export function getGoogleCloudProjectId() {
  return parsed.GOOGLE_CLOUD_PROJECT ?? null;
}

export function getDatabaseHost() {
  return resolvedDatabaseConfig.host;
}

export function hasDatabaseConfig() {
  return Boolean(parsed.DATABASE_URL);
}

export function getDatabaseConnectionMode() {
  return resolvedDatabaseConfig.mode;
}

export function getDatabaseSocketPath() {
  return resolvedDatabaseConfig.socketPath;
}

export function getInstanceConnectionName() {
  return parsed.INSTANCE_CONNECTION_NAME ?? null;
}

export const env = parsed;
