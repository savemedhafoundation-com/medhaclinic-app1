import { onAuthStateChanged, updateProfile } from 'firebase/auth';

import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  auth,
  signInWithPhoneNumber,
  signInWithCredential,
} from './firebaseConfig';
import type {
  AppAuthUser,
  AppAuthUserCredential,
  AppPhoneConfirmation,
  PendingPhoneVerification,
} from './authClient.types';

let phoneRecaptchaVerifier: RecaptchaVerifier | null = null;

function getPhoneRecaptchaVerifier(containerId: string) {
  if (!phoneRecaptchaVerifier) {
    phoneRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
    });
  }

  return phoneRecaptchaVerifier;
}

export function getCurrentAuthUser() {
  return auth.currentUser as AppAuthUser | null;
}

export async function ensureDataConnectAuthReady(
  currentUser?: AppAuthUser | null
) {
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

export async function updateCurrentUserPhotoUrl(photoUrl: string) {
  await auth.authStateReady();

  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('Please sign in again before updating your profile photo.');
  }

  await updateProfile(currentUser, {
    photoURL: photoUrl,
  });
  await currentUser.getIdToken(true);

  return auth.currentUser as AppAuthUser;
}

export function subscribeToAuthChanges(
  callback: (user: AppAuthUser | null) => void
) {
  return onAuthStateChanged(auth, user => {
    callback(user as AppAuthUser | null);
  });
}

export async function signInWithGoogleIdToken(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  return userCredential as AppAuthUserCredential;
}

export async function sendPhoneVerificationCode(
  phoneNumber: string,
  recaptchaContainerId = 'phone-recaptcha-container'
) {
  // Do NOT call verifier.render() — invisible reCAPTCHA fires automatically
  // inside signInWithPhoneNumber. Calling render() first causes the popup to appear.
  const verifier = getPhoneRecaptchaVerifier(recaptchaContainerId);
  const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  return confirmation as AppPhoneConfirmation;
}

export async function getPendingPhoneVerification(): Promise<PendingPhoneVerification | null> {
  return null;
}

export async function signOutFromAuth() {
  await auth.signOut();
}

export function resetPhoneAuthFlow() {
  if (phoneRecaptchaVerifier) {
    phoneRecaptchaVerifier.clear();
    phoneRecaptchaVerifier = null;
  }
}
