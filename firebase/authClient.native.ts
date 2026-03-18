import { getApp as getNativeApp } from '@react-native-firebase/app';
import {
  GoogleAuthProvider as NativeGoogleAuthProvider,
  getAuth as getNativeAuth,
  onAuthStateChanged as onNativeAuthStateChanged,
  signInWithCredential as signInWithNativeCredential,
  signInWithPhoneNumber as signInWithNativePhoneNumber,
  signOut as signOutFromNativeAuth,
} from '@react-native-firebase/auth';
import {
  GoogleAuthProvider,
  PhoneAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

import type {
  AppAuthUser,
  AppAuthUserCredential,
  AppPhoneConfirmation,
} from './authClient.types';
import { auth } from './firebaseConfig';

const nativeAuth = getNativeAuth(getNativeApp());
let pendingDataConnectAuthSync: Promise<void> | null = null;

function trackDataConnectAuthSync<T>(work: () => Promise<T>) {
  const task = (async () => {
    const result = await work();
    await auth.authStateReady();

    if (auth.currentUser) {
      await auth.currentUser.getIdToken();
    }

    return result;
  })();

  const pendingTask = task.then(() => undefined);
  pendingDataConnectAuthSync = pendingTask;

  void pendingTask.finally(() => {
    if (pendingDataConnectAuthSync === pendingTask) {
      pendingDataConnectAuthSync = null;
    }
  });

  return task;
}

export function getCurrentAuthUser() {
  return nativeAuth.currentUser as AppAuthUser | null;
}

export async function ensureDataConnectAuthReady(
  currentUser?: AppAuthUser | null
) {
  if (pendingDataConnectAuthSync) {
    await pendingDataConnectAuthSync;
  }

  await auth.authStateReady();

  const modularUser = auth.currentUser;

  if (!modularUser) {
    throw new Error(
      'Firebase app auth session is unavailable. Please sign in again.'
    );
  }

  if (currentUser && modularUser.uid !== currentUser.uid) {
    throw new Error(
      'Firebase app auth is still syncing with your signed-in user. Please try again.'
    );
  }

  await modularUser.getIdToken();
}

export function subscribeToAuthChanges(
  callback: (user: AppAuthUser | null) => void
) {
  return onNativeAuthStateChanged(nativeAuth, user => {
    if (!user && auth.currentUser) {
      void auth.signOut().catch(error => {
        console.log('Firebase JS sign-out sync error:', error);
      });
    }

    callback(user as AppAuthUser | null);
  });
}

export async function signInWithGoogleIdToken(idToken: string) {
  return trackDataConnectAuthSync(async () => {
    const credential = NativeGoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithNativeCredential(
      nativeAuth,
      credential
    );

    try {
      await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
    } catch (error) {
      await signOutFromNativeAuth(nativeAuth).catch(() => null);
      throw error;
    }

    return userCredential as AppAuthUserCredential;
  });
}

export async function sendPhoneVerificationCode(
  phoneNumber: string,
  _recaptchaContainerId?: string
) {
  const confirmation = await signInWithNativePhoneNumber(
    nativeAuth,
    phoneNumber
  );

  return {
    async confirm(code: string) {
      return trackDataConnectAuthSync(async () => {
        const userCredential = await confirmation.confirm(code);

        if (!confirmation.verificationId) {
          await signOutFromNativeAuth(nativeAuth).catch(() => null);
          throw new Error(
            'Phone sign-in finished on the device, but the Firebase app session could not be synced. Please request a new OTP and try again.'
          );
        }

        try {
          const credential = PhoneAuthProvider.credential(
            confirmation.verificationId,
            code
          );
          await signInWithCredential(auth, credential);
        } catch (error) {
          await signOutFromNativeAuth(nativeAuth).catch(() => null);
          throw error;
        }

        return userCredential as AppAuthUserCredential;
      });
    },
  } satisfies AppPhoneConfirmation;
}

export async function signOutFromAuth() {
  await Promise.allSettled([signOutFromNativeAuth(nativeAuth), auth.signOut()]);
  pendingDataConnectAuthSync = null;
}

export function resetPhoneAuthFlow() {
  // Native Firebase Auth does not use a web reCAPTCHA verifier.
}
