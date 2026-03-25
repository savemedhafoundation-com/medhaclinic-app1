import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';

import {
  AsyncStorage,
  auth as firebaseAuth,
  googleWebClientId,
} from '../firebase/firebaseConfig';
import {
  ensureDataConnectAuthReady,
  getCurrentAuthUser,
  resetPhoneAuthFlow,
  sendPhoneVerificationCode as requestPhoneVerificationCode,
  signInWithGoogleIdToken,
  signOutFromAuth,
  subscribeToAuthChanges,
} from '../firebase/authClient';
import type {
  AppAuthUser,
  AppPhoneConfirmation,
} from '../firebase/authClient.types';
import {
  getCurrentUserData,
  hasCompletedHealthProfile,
  syncAuthenticatedUser,
} from '../services/medhaDataConnect';

export type AuthUserProfile = {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
};

type AuthContextValue = {
  user: AppAuthUser | null;
  profile: AuthUserProfile | null;
  loading: boolean;
  signingIn: boolean;
  phoneVerificationPending: boolean;
  needsProfile: boolean;
  setNeedsProfile: (v: boolean) => void;
  signInWithGoogle: () => Promise<AuthUserProfile>;
  sendPhoneVerificationCode: (
    phoneNumber: string,
    recaptchaContainerId?: string
  ) => Promise<void>;
  confirmPhoneVerificationCode: (code: string) => Promise<AuthUserProfile>;
  resetPhoneVerification: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

let googleIsConfigured = false;

type StoredUserData = Record<string, unknown>;

function getProfileFromUser(user: AppAuthUser): AuthUserProfile {
  return {
    uid: user.uid,
    name: user.displayName ?? user.phoneNumber ?? 'MedhaClinic User',
    email: user.email ?? '',
    photoURL: user.photoURL ?? null,
  };
}

async function persistLocalProfile(profile: AuthUserProfile) {
  let existingData: StoredUserData = {};

  try {
    const rawValue = await AsyncStorage.getItem('medha_user');

    if (rawValue) {
      const parsed = JSON.parse(rawValue) as StoredUserData;
      existingData =
        parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    }
  } catch (error) {
    console.log('Cached profile merge error:', error);
  }

  const cachedFullName =
    typeof existingData.fullName === 'string' ? existingData.fullName.trim() : '';
  const cachedEmail =
    typeof existingData.email === 'string' ? existingData.email.trim() : '';
  const cachedPhotoURL =
    typeof existingData.photoURL === 'string' ? existingData.photoURL : null;

  await AsyncStorage.setItem(
    'medha_user',
    JSON.stringify({
      ...existingData,
      fullName: cachedFullName || profile.name,
      email: profile.email || cachedEmail,
      photoURL: profile.photoURL ?? cachedPhotoURL,
      lastLogin: new Date().toISOString(),
    })
  );
}

async function hasCachedHealthProfile() {
  try {
    const rawValue = await AsyncStorage.getItem('medha_user');
    if (!rawValue) {
      return false;
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (
      !parsedValue ||
      typeof parsedValue !== 'object' ||
      Array.isArray(parsedValue)
    ) {
      return false;
    }

    const parsed = parsedValue as Record<string, unknown>;
    const hasSavedProfileFields =
      'gender' in parsed ||
      'age' in parsed ||
      'weight' in parsed ||
      'height' in parsed ||
      'purpose' in parsed ||
      'address' in parsed;

    return Boolean(
      parsed.profileCompleted === true || hasSavedProfileFields
    );
  } catch (error) {
    console.log('Cached profile read error:', error);
    return false;
  }
}

async function ensureGoogleConfigured() {
  if (googleIsConfigured) {
    return;
  }

  if (!googleWebClientId) {
    throw new Error(
      'Google web client ID is missing. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your app config before using Google sign-in.'
    );
  }

  GoogleSignin.configure({
    webClientId: googleWebClientId,
    scopes: ['email', 'profile'],
  });

  googleIsConfigured = true;
}

function normalizePhoneNumber(value: string) {
  const rawValue = value.trim();

  if (!rawValue) {
    throw new Error('Enter your phone number to continue.');
  }

  if (rawValue.startsWith('+')) {
    const internationalDigits = rawValue.slice(1).replace(/\D/g, '');

    if (internationalDigits.length < 10) {
      throw new Error('Enter a valid phone number to continue.');
    }

    return `+${internationalDigits}`;
  }

  const digits = rawValue.replace(/\D/g, '');
  const indianDigits =
    digits.length > 10 && digits.startsWith('91') ? digits.slice(2) : digits;

  if (indianDigits.length !== 10) {
    throw new Error('Enter a valid 10-digit mobile number.');
  }

  return `+91${indianDigits}`;
}

function toReadableError(error: unknown) {
  if (isErrorWithCode(error)) {
    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        return 'Google sign-in was cancelled.';
      case statusCodes.IN_PROGRESS:
        return 'A Google sign-in request is already in progress.';
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return 'Google Play Services is unavailable or needs an update on this device.';
      default:
        return error.message || 'Google sign-in failed.';
    }
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    switch (error.code) {
      case 'auth/network-request-failed':
        return 'Network error. Check your internet connection and try again.';
      case 'auth/invalid-credential':
        return 'Firebase rejected the Google credential. Verify your SHA-1, package name, and web client ID.';
      case 'auth/app-not-authorized':
        return 'This Android build is not fully registered in Firebase Authentication. Add the active signing certificate SHA-1 and SHA-256 in Firebase Console for the build you installed.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled in Firebase Authentication yet.';
      case 'auth/invalid-phone-number':
        return 'The phone number format is invalid. Enter a valid 10-digit mobile number.';
      case 'auth/missing-phone-number':
        return 'Enter a phone number before requesting an OTP.';
      case 'auth/invalid-verification-code':
        return 'The OTP is invalid. Please check the code and try again.';
      case 'auth/missing-verification-code':
        return 'Enter the OTP sent to your phone.';
      case 'auth/code-expired':
      case 'auth/session-expired':
        return 'The OTP has expired. Please request a new code.';
      case 'auth/captcha-check-failed':
        return 'reCAPTCHA verification failed. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a bit before trying again.';
      case 'auth/quota-exceeded':
        return 'SMS quota exceeded for this project. Please try again later.';
      default:
        break;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong during sign-in.';
}

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

function shouldResetPhoneVerification(error: unknown) {
  const errorCode = getFirebaseErrorCode(error);
  return errorCode === 'auth/code-expired' || errorCode === 'auth/session-expired';
}

function isNoCurrentUserError(error: unknown) {
  const errorCode = getFirebaseErrorCode(error);
  return errorCode === 'auth/no-current-user' || errorCode === 'no-current-user';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AppAuthUser | null>(null);
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [phoneConfirmation, setPhoneConfirmation] =
    useState<AppPhoneConfirmation | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);
  const hydrationRunIdRef = useRef(0);

  async function hydrateSignedInUser(currentUser: AppAuthUser) {
    const nextProfile = getProfileFromUser(currentUser);

    // For phone-auth users, displayName is null so getProfileFromUser falls back
    // to the phone number as the name. Override with the real name the user
    // entered during signup if it's already cached in AsyncStorage.
    if (!currentUser.displayName) {
      try {
        const rawValue = await AsyncStorage.getItem('medha_user');

        if (rawValue) {
          const cached = JSON.parse(rawValue) as Record<string, unknown>;
          const cachedName =
            typeof cached.fullName === 'string' ? cached.fullName.trim() : '';

          // Only use the cached name if it looks like a real name (not a phone number)
          if (cachedName && !cachedName.startsWith('+')) {
            nextProfile.name = cachedName;
          }
        }
      } catch (cacheReadError) {
        console.log('[Auth] Cached name read note:', cacheReadError);
      }
    }

    await persistLocalProfile(nextProfile);
    setProfile(nextProfile);

    try {
      await syncAuthenticatedUser(currentUser);
      const currentUserData = await getCurrentUserData();
      setNeedsProfile(!hasCompletedHealthProfile(currentUserData));
    } catch (error) {
      console.log('Post sign-in sync error:', error);
      setNeedsProfile(!(await hasCachedHealthProfile()));
    }

    return nextProfile;
  }

  function resetPhoneVerification() {
    setPhoneConfirmation(null);
    resetPhoneAuthFlow();
  }

  useEffect(() => {
    let unsubscribe: undefined | (() => void);

    async function bootstrapAuth() {
      try {
        if (Platform.OS !== 'web') {
          await ensureGoogleConfigured();
          await firebaseAuth.authStateReady();

          const nativeUser = getCurrentAuthUser();
          const hasGoogleSession = GoogleSignin.hasPreviousSignIn();

          if (hasGoogleSession && (!nativeUser || !firebaseAuth.currentUser)) {
            const restoredResponse = await GoogleSignin.signInSilently();

            if (
              restoredResponse.type === 'success' &&
              restoredResponse.data.idToken
            ) {
              await signInWithGoogleIdToken(restoredResponse.data.idToken);
            }
          }
        }
      } catch (error) {
        console.log('Google Sign-In bootstrap error:', error);
      }

      unsubscribe = subscribeToAuthChanges(async (currentUser: AppAuthUser | null) => {
        const hydrationRunId = ++hydrationRunIdRef.current;
        const isLatestHydrationRun = () => hydrationRunIdRef.current === hydrationRunId;

        setLoading(true);
        setUser(currentUser);

        try {
          if (currentUser) {
            resetPhoneVerification();
            await ensureDataConnectAuthReady(currentUser);

            if (!isLatestHydrationRun()) {
              return;
            }

            await hydrateSignedInUser(currentUser);
          } else {
            setProfile(null);
            setNeedsProfile(false);
          }
        } catch (error) {
          const latestUser = getCurrentAuthUser();
          const signedOutDuringHydration =
            isNoCurrentUserError(error) &&
            (!latestUser || latestUser.uid !== currentUser?.uid);

          if (!isLatestHydrationRun()) {
            return;
          }

          if (!signedOutDuringHydration) {
            console.log('Auth hydration error:', error);
          }

          if (!latestUser || latestUser.uid !== currentUser?.uid) {
            setUser(latestUser);
            setProfile(null);
            setNeedsProfile(false);
          } else if (currentUser) {
            const nextProfile = getProfileFromUser(currentUser);
            await persistLocalProfile(nextProfile);
            setProfile(nextProfile);
            setNeedsProfile(!(await hasCachedHealthProfile()));
          } else {
            setProfile(null);
            setNeedsProfile(false);
          }
        }

        if (isLatestHydrationRun()) {
          setLoading(false);
        }
      });
    }

    void bootstrapAuth();

    return () => {
      hydrationRunIdRef.current += 1;
      resetPhoneVerification();
      unsubscribe?.();
    };
  }, []);

  async function signInWithGoogle() {
    setSigningIn(true);

    try {
      if (Platform.OS === 'web') {
        throw new Error(
          'Google sign-in is currently configured for native builds in this app.'
        );
      }

      await ensureGoogleConfigured();
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.log('No previous Google session to clear:', error);
      }

      const response = await GoogleSignin.signIn();

      if (isCancelledResponse(response)) {
        throw new Error('Google sign-in was cancelled.');
      }

      if (!isSuccessResponse(response)) {
        throw new Error('Google sign-in did not complete successfully.');
      }

      const idToken = response.data.idToken;

      if (!idToken) {
        throw new Error(
          'Google sign-in did not return an ID token. Verify the Google web client ID in Firebase.'
        );
      }

      const credentialResult = await signInWithGoogleIdToken(idToken);
      await ensureDataConnectAuthReady(credentialResult.user);
      return getProfileFromUser(credentialResult.user);
    } catch (error) {
      throw new Error(toReadableError(error));
    } finally {
      setSigningIn(false);
    }
  }

  async function sendPhoneVerificationCode(
    phoneNumber: string,
    recaptchaContainerId = 'phone-recaptcha-container'
  ) {
    try {
      const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
      const confirmation = await requestPhoneVerificationCode(
        normalizedPhoneNumber,
        recaptchaContainerId
      );

      setPhoneConfirmation(confirmation);
    } catch (error) {
      resetPhoneVerification();
      throw new Error(toReadableError(error));
    }
  }

  async function confirmPhoneVerificationCode(code: string) {
    if (!phoneConfirmation) {
      throw new Error('Request an OTP first.');
    }

    const trimmedCode = code.trim();

    if (!trimmedCode) {
      throw new Error('Enter the OTP sent to your phone.');
    }

    try {
      const credentialResult = await phoneConfirmation.confirm(trimmedCode);

      // DataConnect sync is non-fatal for phone auth on native — the web SDK
      // may not have synced if the native SDK consumed the OTP first.
      // The auth state listener and hydrateSignedInUser handle the rest.
      try {
        await ensureDataConnectAuthReady(credentialResult.user);
      } catch (syncError) {
        console.log('[Auth] DataConnect ready check note (non-fatal):', syncError);
      }

      resetPhoneVerification();
      return getProfileFromUser(credentialResult.user);
    } catch (error) {
      if (shouldResetPhoneVerification(error)) {
        resetPhoneVerification();
      }

      throw new Error(toReadableError(error));
    }
  }

  async function signOut() {
    await Promise.allSettled([
      Platform.OS === 'web' ? Promise.resolve() : GoogleSignin.signOut(),
      signOutFromAuth(),
      AsyncStorage.removeItem('medha_user'),
    ]);

    resetPhoneVerification();
    setProfile(null);
    setUser(null);
    setNeedsProfile(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signingIn,
        phoneVerificationPending: Boolean(phoneConfirmation),
        needsProfile,
        setNeedsProfile,
        signInWithGoogle,
        sendPhoneVerificationCode,
        confirmPhoneVerificationCode,
        resetPhoneVerification,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
