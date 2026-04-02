import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  type ConfirmationResult,
  GoogleAuthProvider,
  RecaptchaVerifier,
  getAuth,
  signInWithPhoneNumber,
  signInWithCredential,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

type EmbeddedFirebaseConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

type EmbeddedPublicConfig = {
  backendUrl?: string;
  firebase?: EmbeddedFirebaseConfig;
  firebaseDataConnectEmulatorHost?: string;
  googleWebClientId?: string;
};

type ConstantsWithLegacyManifest = typeof Constants & {
  manifest?: {
    extra?: {
      publicConfig?: EmbeddedPublicConfig;
    };
  };
  manifest2?: {
    extra?: {
      publicConfig?: EmbeddedPublicConfig;
    };
  };
};

function getEmbeddedPublicConfig(): EmbeddedPublicConfig {
  const constantsWithLegacyManifest = Constants as ConstantsWithLegacyManifest;

  return (
    (Constants.expoConfig?.extra?.publicConfig as EmbeddedPublicConfig | undefined) ??
    constantsWithLegacyManifest.manifest2?.extra?.publicConfig ??
    constantsWithLegacyManifest.manifest?.extra?.publicConfig ??
    {}
  );
}

const embeddedPublicConfig = getEmbeddedPublicConfig();

function readPublicConfigValue(name: string, fallbackValue?: string) {
  return process.env[name]?.trim() || fallbackValue?.trim() || '';
}

function normalizeUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

export const firebaseConfig = {
  apiKey: readPublicConfigValue(
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    embeddedPublicConfig.firebase?.apiKey
  ),
  authDomain: readPublicConfigValue(
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    embeddedPublicConfig.firebase?.authDomain
  ),
  projectId: readPublicConfigValue(
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    embeddedPublicConfig.firebase?.projectId
  ),
  storageBucket: readPublicConfigValue(
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    embeddedPublicConfig.firebase?.storageBucket
  ),
  messagingSenderId: readPublicConfigValue(
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    embeddedPublicConfig.firebase?.messagingSenderId
  ),
  appId: readPublicConfigValue(
    'EXPO_PUBLIC_FIREBASE_APP_ID',
    embeddedPublicConfig.firebase?.appId
  ),
};

export const googleWebClientId = readPublicConfigValue(
  'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
  embeddedPublicConfig.googleWebClientId
);

const configuredBackendUrl = readPublicConfigValue(
  'EXPO_PUBLIC_BACKEND_URL',
  embeddedPublicConfig.backendUrl
);

export const backendBaseUrl = configuredBackendUrl
  ? normalizeUrl(configuredBackendUrl)
  : '';

export const firebaseDataConnectEmulatorHost = readPublicConfigValue(
  'EXPO_PUBLIC_FIREBASE_DATACONNECT_EMULATOR_HOST',
  embeddedPublicConfig.firebaseDataConnectEmulatorHost
);

const missingFirebaseKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingFirebaseKeys.length > 0) {
  throw new Error(
    `Firebase config is incomplete. Missing: ${missingFirebaseKeys.join(', ')}`
  );
}

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

type FirebaseAuthInstance = ReturnType<typeof getAuth>;

type ReactNativeAuthModule = {
  getReactNativePersistence: (storage: typeof AsyncStorage) => unknown;
  initializeAuth: (
    app: typeof firebaseApp,
    deps: { persistence: unknown }
  ) => FirebaseAuthInstance;
};

function createAuth() {
  if (Platform.OS === 'web') {
    return getAuth(firebaseApp);
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const reactNativeAuth = require('firebase/auth') as ReactNativeAuthModule;

  try {
    return reactNativeAuth.initializeAuth(firebaseApp, {
      persistence: reactNativeAuth.getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('initializeAuth() has already been called')
    ) {
      return getAuth(firebaseApp);
    }

    throw error;
  }
}

export const auth = createAuth();
export const storage = getStorage(
  firebaseApp,
  firebaseConfig.storageBucket.startsWith('gs://')
    ? firebaseConfig.storageBucket
    : `gs://${firebaseConfig.storageBucket}`
);
export {
  AsyncStorage,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signInWithPhoneNumber,
};
export type { ConfirmationResult };
export const db = getFirestore(firebaseApp);
