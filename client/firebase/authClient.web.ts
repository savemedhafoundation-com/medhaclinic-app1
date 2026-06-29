import { onAuthStateChanged, updateProfile } from 'firebase/auth';

import {
  AsyncStorage,
  GoogleAuthProvider,
  auth,
  backendBaseUrl,
  signInWithCredential,
} from './firebaseConfig';
import type {
  AppAuthUser,
  AppAuthUserCredential,
  AppPhoneConfirmation,
  PendingPhoneVerification,
} from './authClient.types';

const TWILIO_AUTH_SESSION_STORAGE_KEY = 'medha_twilio_auth_session';
const PENDING_PHONE_VERIFICATION_STORAGE_KEY =
  'medha_pending_phone_verification';

type StoredTwilioAuthSession = {
  token: string;
  expiresAt: string;
  user: {
    uid: string;
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
  };
};

let twilioAuthSession: StoredTwilioAuthSession | null = null;
const twilioAuthListeners = new Set<(user: AppAuthUser | null) => void>();

function isTwilioSessionValid(session: StoredTwilioAuthSession | null) {
  return Boolean(
    session?.token &&
      session.expiresAt &&
      new Date(session.expiresAt).getTime() > Date.now()
  );
}

function toTwilioAppAuthUser(
  session: StoredTwilioAuthSession | null
): AppAuthUser | null {
  if (!isTwilioSessionValid(session)) {
    return null;
  }

  return {
    uid: session!.user.uid,
    displayName: session!.user.displayName,
    email: session!.user.email,
    phoneNumber: session!.user.phoneNumber,
    photoURL: session!.user.photoURL,
    getIdToken: async () => session!.token,
  };
}

async function readTwilioAuthSession() {
  if (isTwilioSessionValid(twilioAuthSession)) {
    return twilioAuthSession;
  }

  const rawValue = await AsyncStorage.getItem(TWILIO_AUTH_SESSION_STORAGE_KEY);

  if (!rawValue) {
    twilioAuthSession = null;
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredTwilioAuthSession;

    if (!isTwilioSessionValid(parsed)) {
      await AsyncStorage.removeItem(TWILIO_AUTH_SESSION_STORAGE_KEY);
      twilioAuthSession = null;
      return null;
    }

    twilioAuthSession = parsed;
    return parsed;
  } catch {
    await AsyncStorage.removeItem(TWILIO_AUTH_SESSION_STORAGE_KEY);
    twilioAuthSession = null;
    return null;
  }
}

async function saveTwilioAuthSession(session: StoredTwilioAuthSession) {
  twilioAuthSession = session;
  await AsyncStorage.setItem(
    TWILIO_AUTH_SESSION_STORAGE_KEY,
    JSON.stringify(session)
  );
}

async function clearTwilioAuthSession() {
  twilioAuthSession = null;
  await AsyncStorage.removeItem(TWILIO_AUTH_SESSION_STORAGE_KEY);
}

function notifyTwilioAuthListeners() {
  const user = toTwilioAppAuthUser(twilioAuthSession);

  for (const listener of twilioAuthListeners) {
    listener(user);
  }
}

async function requestPhoneAuthBackend<T>(
  path: '/v1/auth/send-otp' | '/v1/auth/verify-otp',
  body: Record<string, unknown>
) {
  if (!backendBaseUrl) {
    throw new Error(
      'Backend URL is not configured. Set EXPO_PUBLIC_BACKEND_URL before using phone sign-in.'
    );
  }

  const response = await fetch(`${backendBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const responseText = await response.text();
  const payload = responseText ? (JSON.parse(responseText) as unknown) : null;

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === 'object' &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : `Phone authentication failed with status ${response.status}.`;

    throw new Error(message);
  }

  return payload as T;
}

function createTwilioPhoneConfirmation(phoneNumber: string) {
  return {
    async confirm(code: string) {
      const response = await requestPhoneAuthBackend<{
        data?: {
          token?: string;
          expiresAt?: string;
          user?: {
            uid?: string;
            displayName?: string | null;
            email?: string | null;
            phoneNumber?: string | null;
            photoURL?: string | null;
          };
        };
      }>('/v1/auth/verify-otp', {
        phoneNumber,
        code,
      });
      const data = response.data;

      if (!data?.token || !data.expiresAt || !data.user?.uid) {
        throw new Error('Phone sign-in did not return a valid app session.');
      }

      const session: StoredTwilioAuthSession = {
        token: data.token,
        expiresAt: data.expiresAt,
        user: {
          uid: data.user.uid,
          displayName: data.user.displayName ?? null,
          email: data.user.email ?? null,
          phoneNumber: data.user.phoneNumber ?? phoneNumber,
          photoURL: data.user.photoURL ?? null,
        },
      };

      await saveTwilioAuthSession(session);
      await AsyncStorage.removeItem(PENDING_PHONE_VERIFICATION_STORAGE_KEY);
      await auth.signOut().catch(() => null);
      notifyTwilioAuthListeners();

      return {
        user: toTwilioAppAuthUser(session)!,
      } satisfies AppAuthUserCredential;
    },
  } satisfies AppPhoneConfirmation;
}

export function getCurrentAuthUser() {
  return (auth.currentUser as AppAuthUser | null) ?? toTwilioAppAuthUser(twilioAuthSession);
}

export async function ensureDataConnectAuthReady(
  currentUser?: AppAuthUser | null
) {
  if (toTwilioAppAuthUser(twilioAuthSession)?.uid === currentUser?.uid) {
    return;
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

export async function updateCurrentUserPhotoUrl(photoUrl: string) {
  await auth.authStateReady();

  const currentUser = auth.currentUser;

  if (currentUser) {
    await updateProfile(currentUser, {
      photoURL: photoUrl,
    });
    await currentUser.getIdToken(true);

    return auth.currentUser as AppAuthUser;
  }

  if (isTwilioSessionValid(twilioAuthSession)) {
    const nextSession: StoredTwilioAuthSession = {
      ...twilioAuthSession!,
      user: {
        ...twilioAuthSession!.user,
        photoURL: photoUrl,
      },
    };

    await saveTwilioAuthSession(nextSession);
    notifyTwilioAuthListeners();
    return toTwilioAppAuthUser(nextSession)!;
  }

  throw new Error('Please sign in again before updating your profile photo.');
}

export function subscribeToAuthChanges(
  callback: (user: AppAuthUser | null) => void
) {
  twilioAuthListeners.add(callback);
  void readTwilioAuthSession().then(session => {
    if (!auth.currentUser) {
      callback(toTwilioAppAuthUser(session));
    }
  });

  const unsubscribe = onAuthStateChanged(auth, user => {
    if (user) {
      void clearTwilioAuthSession();
    }

    callback((user as AppAuthUser | null) ?? toTwilioAppAuthUser(twilioAuthSession));
  });

  return () => {
    twilioAuthListeners.delete(callback);
    unsubscribe();
  };
}

export async function signInWithGoogleIdToken(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  await clearTwilioAuthSession();
  return userCredential as AppAuthUserCredential;
}

export async function sendPhoneVerificationCode(phoneNumber: string) {
  await requestPhoneAuthBackend('/v1/auth/send-otp', { phoneNumber });
  await AsyncStorage.setItem(
    PENDING_PHONE_VERIFICATION_STORAGE_KEY,
    JSON.stringify({
      createdAt: Date.now(),
      phoneNumber,
      verificationId: 'twilio',
    })
  );

  return createTwilioPhoneConfirmation(phoneNumber);
}

export async function getPendingPhoneVerification(): Promise<PendingPhoneVerification | null> {
  const rawValue = await AsyncStorage.getItem(PENDING_PHONE_VERIFICATION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as { phoneNumber?: unknown };

    if (typeof parsed.phoneNumber !== 'string' || !parsed.phoneNumber.trim()) {
      await AsyncStorage.removeItem(PENDING_PHONE_VERIFICATION_STORAGE_KEY);
      return null;
    }

    return {
      confirmation: createTwilioPhoneConfirmation(parsed.phoneNumber),
      phoneNumber: parsed.phoneNumber,
    };
  } catch {
    await AsyncStorage.removeItem(PENDING_PHONE_VERIFICATION_STORAGE_KEY);
    return null;
  }
}

export async function signOutFromAuth() {
  await Promise.allSettled([auth.signOut(), clearTwilioAuthSession()]);
  await AsyncStorage.removeItem(PENDING_PHONE_VERIFICATION_STORAGE_KEY);
  notifyTwilioAuthListeners();
}

export function resetPhoneAuthFlow() {
  void AsyncStorage.removeItem(PENDING_PHONE_VERIFICATION_STORAGE_KEY);
}
