import { spawn } from 'node:child_process';

function getTrimmedEnv(name) {
  return process.env[name]?.trim();
}

function buildResolvedDatabaseUrl() {
  const directMigrationUrl = getTrimmedEnv('DIRECT_DATABASE_URL');

  if (directMigrationUrl) {
    return directMigrationUrl;
  }

  const directDatabaseUrl = getTrimmedEnv('DATABASE_URL');

  if (directDatabaseUrl) {
    return directDatabaseUrl;
  }

  const user = getTrimmedEnv('DB_USER');
  const password = getTrimmedEnv('DB_PASS');
  const database = getTrimmedEnv('DB_NAME');
  const socketDir = getTrimmedEnv('DB_SOCKET_DIR') || '/cloudsql';
  const instanceConnectionName = getTrimmedEnv('INSTANCE_CONNECTION_NAME');
  const host = getTrimmedEnv('DB_HOST');
  const schema = getTrimmedEnv('DB_SCHEMA') || 'public';
  const port = getTrimmedEnv('DB_PORT') || '5432';

  if (!user || !password || !database) {
    return null;
  }

  const databaseUrl = new URL('postgresql://localhost');
  databaseUrl.username = user;
  databaseUrl.password = password;
  databaseUrl.pathname = `/${database}`;
  databaseUrl.searchParams.set('schema', schema);

  if (instanceConnectionName) {
    databaseUrl.hostname = 'localhost';
    databaseUrl.port = port;
    databaseUrl.searchParams.set(
      'host',
      `${socketDir.replace(/\/+$/, '')}/${instanceConnectionName}`
    );
    return databaseUrl.toString();
  }

  if (host) {
    databaseUrl.hostname = host;
    databaseUrl.port = port;
    return databaseUrl.toString();
  }

  return null;
}

const resolvedDatabaseUrl = buildResolvedDatabaseUrl();

if (resolvedDatabaseUrl) {
  process.env.DATABASE_URL = resolvedDatabaseUrl;
}

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is missing. Set DATABASE_URL directly, or set DB_USER, DB_PASS, DB_NAME, and DB_HOST.'
  );
  process.exit(1);
}

const prismaBinary =
  process.platform === 'win32' ? '.\\node_modules\\.bin\\prisma.cmd' : './node_modules/.bin/prisma';

const child = spawn(prismaBinary, process.argv.slice(2), {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', code => {
  process.exit(code ?? 1);
});

child.on('error', error => {
  console.error('Failed to launch Prisma CLI:', error);
  process.exit(1);
});
