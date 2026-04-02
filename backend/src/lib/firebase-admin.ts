import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

import {
  env,
  getFirebaseAdminProjectId,
  hasFirebaseAdminConfig,
  hasGoogleCloudRuntime,
} from './env.js';

function getServiceAccount() {
  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const parsed = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON) as {
      project_id?: string;
      projectId?: string;
      client_email?: string;
      clientEmail?: string;
      private_key?: string;
      privateKey?: string;
    };

    return {
      projectId: parsed.projectId ?? parsed.project_id ?? '',
      clientEmail: parsed.clientEmail ?? parsed.client_email ?? '',
      privateKey: parsed.privateKey ?? parsed.private_key ?? '',
    };
  }

  if (
    env.FIREBASE_PROJECT_ID &&
    env.FIREBASE_CLIENT_EMAIL &&
    env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY,
    };
  }

  return null;
}

function getFirebaseAdminOptions() {
  const projectId = getFirebaseAdminProjectId() ?? undefined;
  const explicitServiceAccount = getServiceAccount();

  if (explicitServiceAccount) {
    return {
      credential: cert(explicitServiceAccount),
      projectId: explicitServiceAccount.projectId || projectId,
    };
  }

  if (env.GOOGLE_APPLICATION_CREDENTIALS || hasGoogleCloudRuntime()) {
    return {
      credential: applicationDefault(),
      projectId,
    };
  }

  return {
    projectId,
  };
}

let adminAuth: Auth | null = null;

export function getAdminAuth() {
  if (!hasFirebaseAdminConfig()) {
    throw new Error(
      'Firebase Admin credentials are not configured. Set GOOGLE_APPLICATION_CREDENTIALS, FIREBASE_SERVICE_ACCOUNT_JSON, or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
    );
  }

  if (!adminAuth) {
    const adminApp =
      getApps()[0] ??
      initializeApp(getFirebaseAdminOptions());

    adminAuth = getAuth(adminApp);
  }

  return adminAuth;
}
