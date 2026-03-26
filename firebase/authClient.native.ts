import { getApp as getNativeApp } from '@react-native-firebase/app';
import {
  type FirebaseAuthTypes,
  GoogleAuthProvider as NativeGoogleAuthProvider,
  getAuth as getNativeAuth,
  onAuthStateChanged as onNativeAuthStateChanged,
  signInWithCredential as signInWithNativeCredential,
  signInWithPhoneNumber as signInWithNativePhoneNumber,
  signOut as signOutFromNativeAuth,
} from '@react-native-firebase/auth';
import {
  deleteUser as deleteNativeUser,
  getIdToken as getNativeIdToken,
  getIdTokenResult as getNativeIdTokenResult,
  reload as reloadNativeUser,
  updateProfile as updateNativeProfile,
} from '@react-native-firebase/auth/lib/modular';

type NativeUser = FirebaseAuthTypes.User;
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
let pendingWebSdkSignIn: Promise<void> | null = null;
let suppressWebSdkProxyInjection = false;
let lastKnownNativeUser: NativeUser | null = nativeAuth.currentUser;

type NativeWrappedAppAuthUser = AppAuthUser & {
  __nativeUser?: NativeUser;
};

const NATIVE_WEB_PROXY_MARKER = '__medhaNativeWebSdkProxyUser';

function getFirebaseErrorCode(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }

  return null;
}

function isNoCurrentUserError(error: unknown) {
  const errorCode = getFirebaseErrorCode(error);
  return errorCode === 'auth/no-current-user' || errorCode === 'no-current-user';
}

function toAppAuthUser(nativeUser: NativeUser | null): NativeWrappedAppAuthUser | null {
  if (!nativeUser) {
    return null;
  }

  const appUser: NativeWrappedAppAuthUser = {
    uid: nativeUser.uid,
    displayName: nativeUser.displayName ?? null,
    email: nativeUser.email ?? null,
    phoneNumber: nativeUser.phoneNumber ?? null,
    photoURL: nativeUser.photoURL ?? null,
    getIdToken: (forceRefresh?: boolean) =>
      getNativeIdToken(nativeUser, forceRefresh),
  };

  Object.defineProperty(appUser, '__nativeUser', {
    configurable: true,
    enumerable: false,
    writable: false,
    value: nativeUser,
  });

  return appUser;
}

function unwrapNativeUser(currentUser?: AppAuthUser | null) {
  return (currentUser as NativeWrappedAppAuthUser | null | undefined)?.__nativeUser ?? null;
}

// ---------------------------------------------------------------------------
// Web SDK proxy injection
// ---------------------------------------------------------------------------
// Firebase DataConnect uses firebase/auth's auth.currentUser.getIdToken() to
// authenticate requests. After native phone sign-in, the web SDK has no
// current user because the OTP is one-time-use and can't be re-verified.
//
// Solution: inject a lightweight proxy User object into auth.currentUser that
// delegates getIdToken() to the native user. Firebase SDK v9+ stores
// currentUser as a plain class property on AuthImpl, so direct assignment
// works cleanly. DataConnect then gets valid ID tokens from the already-
// authenticated native session.
// ---------------------------------------------------------------------------

function buildProxyUser(nativeUser: NativeUser | null) {
  if (!nativeUser) return null;

  return {
    [NATIVE_WEB_PROXY_MARKER]: true,
    uid: nativeUser.uid,
    phoneNumber: nativeUser.phoneNumber ?? null,
    displayName: nativeUser.displayName ?? null,
    email: nativeUser.email ?? null,
    photoURL: nativeUser.photoURL ?? null,
    emailVerified: nativeUser.emailVerified ?? false,
    isAnonymous: nativeUser.isAnonymous ?? false,
    tenantId: null,
    providerId: 'firebase',
    metadata: {
      creationTime: nativeUser.metadata?.creationTime ?? new Date().toUTCString(),
      lastSignInTime: nativeUser.metadata?.lastSignInTime ?? new Date().toUTCString(),
    },
    providerData: (nativeUser.providerData ?? []).map((p) => ({
      uid: p.uid ?? nativeUser.uid,
      providerId: p.providerId ?? 'phone',
      displayName: p.displayName ?? null,
      email: p.email ?? null,
      phoneNumber: p.phoneNumber ?? nativeUser.phoneNumber ?? null,
      photoURL: p.photoURL ?? null,
    })),
    // getIdToken delegates to the native SDK which handles token refresh automatically
    getIdToken: (forceRefresh?: boolean) =>
      getNativeIdToken(nativeUser, forceRefresh ?? false),
    getIdTokenResult: (forceRefresh?: boolean) =>
      getNativeIdTokenResult(nativeUser, forceRefresh ?? false),
    reload: () => reloadNativeUser(nativeUser),
    _startProactiveRefresh: () => undefined,
    _stopProactiveRefresh: () => undefined,
    toJSON: () => ({ uid: nativeUser.uid }),
    delete: () => deleteNativeUser(nativeUser),
  };
}

function getPropertyDescriptor(
  target: object,
  key: PropertyKey
): PropertyDescriptor | undefined {
  let current: object | null = target;

  while (current) {
    const descriptor = Object.getOwnPropertyDescriptor(current, key);

    if (descriptor) {
      return descriptor;
    }

    current = Object.getPrototypeOf(current);
  }

  return undefined;
}

function trySetProperty(
  target: object,
  key: 'currentUser' | '_currentUser',
  value: unknown
) {
  const descriptor = getPropertyDescriptor(target, key);

  if (!descriptor) {
    try {
      Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        writable: true,
        value,
      });
      return true;
    } catch {
      return false;
    }
  }

  if (typeof descriptor.set === 'function') {
    descriptor.set.call(target, value);
    return true;
  }

  if ('writable' in descriptor && descriptor.writable) {
    Reflect.set(target as Record<string, unknown>, key, value);
    return true;
  }

  if (descriptor.configurable) {
    Object.defineProperty(target, key, {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable ?? true,
      writable: true,
      value,
    });
    return true;
  }

  return false;
}

function setWebSdkCurrentUser(nextUser: unknown) {
  const webAuth = auth as unknown as {
    currentUser: unknown;
    _currentUser?: unknown;
  };

  const currentUserUpdated = trySetProperty(webAuth, 'currentUser', nextUser);

  if (!currentUserUpdated) {
    throw new TypeError('Unable to sync Firebase Web SDK currentUser proxy.');
  }

  if ('_currentUser' in webAuth) {
    trySetProperty(webAuth, '_currentUser', nextUser);
  }
}

function trackPendingWebSdkSignIn<T>(work: Promise<T>) {
  const pendingTask = work.then(
    () => undefined,
    () => undefined
  );

  pendingWebSdkSignIn = pendingTask;

  void pendingTask.finally(() => {
    if (pendingWebSdkSignIn === pendingTask) {
      pendingWebSdkSignIn = null;
    }
  });

  return work;
}

function resolveNativeUserCandidate(currentUser?: AppAuthUser | null) {
  return (
    nativeAuth.currentUser ??
    lastKnownNativeUser ??
    unwrapNativeUser(currentUser) ??
    null
  );
}

/**
 * Inject (or clear) a proxy User into the web Firebase SDK auth instance so
 * that DataConnect and other web-SDK services can authenticate using the
 * native user's ID token, without needing a separate web SDK sign-in.
 */
function syncWebSdkFromNativeUser(
  nativeUser: NativeUser | null
) {
  try {
    lastKnownNativeUser = nativeUser;
    const webAuth = auth as unknown as { currentUser: unknown };

    if (!nativeUser) {
      setWebSdkCurrentUser(null);
      return;
    }

    if (suppressWebSdkProxyInjection) {
      return;
    }

    if (pendingWebSdkSignIn) {
      return;
    }

    // Skip if the web SDK already has this user (Google auth signs in both SDKs)
    const existingWebUser = webAuth.currentUser as { uid?: string } | null;
    if (existingWebUser?.uid === nativeUser.uid) {
      return;
    }

    setWebSdkCurrentUser(buildProxyUser(nativeUser));
  } catch (injectError) {
    // Non-fatal — DataConnect will fall back to ensureDataConnectAuthReady's
    // native-user fallback path.
    console.log('[AuthClient] Web SDK user proxy sync note:', injectError);
  }
}

// ---------------------------------------------------------------------------

function trackDataConnectAuthSync<T>(work: () => Promise<T>) {
  const task = (async () => {
    const result = await work();
    await ensureDataConnectAuthReadyInternal(
      (nativeAuth.currentUser ?? lastKnownNativeUser) as AppAuthUser | null,
      false
    );

    return result;
  })();

  const pendingTask = task.then(
    () => undefined,
    () => undefined
  );
  pendingDataConnectAuthSync = pendingTask;

  void pendingTask.finally(() => {
    if (pendingDataConnectAuthSync === pendingTask) {
      pendingDataConnectAuthSync = null;
    }
  });

  return task;
}

export function getCurrentAuthUser() {
  return toAppAuthUser(nativeAuth.currentUser);
}

async function ensureDataConnectAuthReadyInternal(
  currentUser?: AppAuthUser | null,
  waitForPending = true
) {
  if (waitForPending && pendingDataConnectAuthSync) {
    await pendingDataConnectAuthSync;
  }

  if (waitForPending && pendingWebSdkSignIn) {
    await pendingWebSdkSignIn;
  }

  const expectedUid = currentUser?.uid ?? null;
  await auth.authStateReady();

  const modularUser = auth.currentUser;

  if (modularUser && (!expectedUid || modularUser.uid === expectedUid)) {
    try {
      await modularUser.getIdToken();
      return;
    } catch (error) {
      if (!isNoCurrentUserError(error)) {
        throw error;
      }
    }
  }

  const nativeUser = resolveNativeUserCandidate(currentUser);

  if (nativeUser) {
    if (expectedUid && nativeUser.uid !== expectedUid) {
      throw new Error(
        'Firebase app auth is still syncing with your signed-in user. Please try again.'
      );
    }

    syncWebSdkFromNativeUser(nativeUser);

    try {
      await getNativeIdToken(nativeUser);
      return;
    } catch (error) {
      if (!isNoCurrentUserError(error)) {
        throw error;
      }
    }
  }

  setWebSdkCurrentUser(null);
  throw new Error(
    'Firebase app auth session is unavailable. Please sign in again.'
  );
}

export async function ensureDataConnectAuthReady(
  currentUser?: AppAuthUser | null
) {
  await ensureDataConnectAuthReadyInternal(currentUser);
}

export async function updateCurrentUserPhotoUrl(photoUrl: string) {
  const currentUser = nativeAuth.currentUser;

  if (!currentUser) {
    throw new Error('Please sign in again before updating your profile photo.');
  }

  await updateNativeProfile(currentUser, {
    photoURL: photoUrl,
  });
  await getNativeIdToken(currentUser, true);
  lastKnownNativeUser = currentUser;
  syncWebSdkFromNativeUser(currentUser);

  return toAppAuthUser(currentUser)!;
}

export function subscribeToAuthChanges(
  callback: (user: AppAuthUser | null) => void
) {
  return onNativeAuthStateChanged(nativeAuth, user => {
    lastKnownNativeUser = user;

    if (!user) {
      // Native user signed out — clear the web SDK proxy and sign out web SDK
      syncWebSdkFromNativeUser(null);
      void auth.signOut().catch(error => {
        console.log('Firebase JS sign-out sync error:', error);
      });
    } else if (!auth.currentUser || (auth.currentUser as { uid?: string }).uid !== user.uid) {
      // Native user changed and web SDK is out of sync — inject proxy
      syncWebSdkFromNativeUser(user);
    }

    callback(toAppAuthUser(user));
  });
}

export async function signInWithGoogleIdToken(idToken: string) {
  return trackDataConnectAuthSync(async () => {
    suppressWebSdkProxyInjection = true;
    const credential = NativeGoogleAuthProvider.credential(idToken);
    try {
      const userCredential = await signInWithNativeCredential(
        nativeAuth,
        credential
      );
      lastKnownNativeUser = userCredential.user;

      await trackPendingWebSdkSignIn(
        signInWithCredential(auth, GoogleAuthProvider.credential(idToken))
      );

      return {
        user: toAppAuthUser(userCredential.user)!,
      } satisfies AppAuthUserCredential;
    } catch (error) {
      lastKnownNativeUser = null;
      await signOutFromNativeAuth(nativeAuth).catch(() => null);
      throw error;
    } finally {
      suppressWebSdkProxyInjection = false;
    }
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
        const verificationId = confirmation.verificationId;

        if (!verificationId) {
          throw new Error(
            'Verification session is invalid. Please request a new OTP and try again.'
          );
        }

        // Attempt both sign-ins concurrently. Native SDK uses device-level
        // attestation; web SDK uses Firebase REST. If the web SDK fails
        // (OTP already consumed by native), the proxy injection below recovers.
        const webCredential = PhoneAuthProvider.credential(verificationId, code);

        const [nativeResult, webResult] = await Promise.allSettled([
          confirmation.confirm(code),
          signInWithCredential(auth, webCredential),
        ]);

        if (nativeResult.status === 'rejected') {
          // Native sign-in failed — roll back any partial web sign-in
          await Promise.allSettled([auth.signOut(), signOutFromNativeAuth(nativeAuth)]);
          throw nativeResult.reason as Error;
        }

        const nativeCredential = nativeResult.value as
          | FirebaseAuthTypes.UserCredential
          | null;

        if (!nativeCredential?.user) {
          await Promise.allSettled([auth.signOut(), signOutFromNativeAuth(nativeAuth)]);
          throw new Error(
            'Phone sign-in finished on the device, but the Firebase app session could not be synced. Please request a new OTP and try again.'
          );
        }

        if (webResult.status === 'rejected') {
          // Web SDK couldn't sign in (OTP consumed by native SDK first).
          // Inject a proxy user so DataConnect can still get valid tokens.
          const webError = webResult.reason as { code?: string } | Error;
          console.log(
            '[AuthClient] Web SDK phone auth sync note — injecting proxy user:',
            (webError as { code?: string }).code ?? webError
          );
          lastKnownNativeUser = nativeCredential.user;
          syncWebSdkFromNativeUser(
            nativeAuth.currentUser ?? nativeCredential.user
          );
        }

        return {
          user: toAppAuthUser(nativeCredential.user)!,
        } satisfies AppAuthUserCredential;
      });
    },
  } satisfies AppPhoneConfirmation;
}

export async function signOutFromAuth() {
  syncWebSdkFromNativeUser(null);
  await Promise.allSettled([signOutFromNativeAuth(nativeAuth), auth.signOut()]);
  pendingDataConnectAuthSync = null;
  pendingWebSdkSignIn = null;
  suppressWebSdkProxyInjection = false;
  lastKnownNativeUser = null;
}

export function resetPhoneAuthFlow() {
  // Native Firebase Auth does not use a web reCAPTCHA verifier.
}
