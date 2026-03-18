import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { Platform } from 'react-native';

function readExpoEnv(name: string) {
  return process.env[name]?.trim() ?? '';
}

export const firebaseConfig = {
  apiKey: readExpoEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: readExpoEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: readExpoEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: readExpoEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readExpoEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readExpoEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
};

export const googleWebClientId = readExpoEnv('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');

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
export {
  AsyncStorage,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signInWithPhoneNumber,
};
export type { ConfirmationResult };
export const db = getFirestore(firebaseApp);
