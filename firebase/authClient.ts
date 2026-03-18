/* eslint-disable @typescript-eslint/no-require-imports */
import { Platform } from 'react-native';

import type {
  AppAuthUser,
  AppAuthUserCredential,
  AppPhoneConfirmation,
} from './authClient.types';

type AuthClientModule = {
  getCurrentAuthUser: () => AppAuthUser | null;
  ensureDataConnectAuthReady: (
    currentUser?: AppAuthUser | null
  ) => Promise<void>;
  subscribeToAuthChanges: (
    callback: (user: AppAuthUser | null) => void
  ) => () => void;
  signInWithGoogleIdToken: (idToken: string) => Promise<AppAuthUserCredential>;
  sendPhoneVerificationCode: (
    phoneNumber: string,
    recaptchaContainerId?: string
  ) => Promise<AppPhoneConfirmation>;
  signOutFromAuth: () => Promise<void>;
  resetPhoneAuthFlow: () => void;
};

const authClient: AuthClientModule =
  Platform.OS === 'web'
    ? require('./authClient.web')
    : require('./authClient.native');

export const getCurrentAuthUser = authClient.getCurrentAuthUser;
export const ensureDataConnectAuthReady =
  authClient.ensureDataConnectAuthReady;
export const subscribeToAuthChanges = authClient.subscribeToAuthChanges;
export const signInWithGoogleIdToken = authClient.signInWithGoogleIdToken;
export const sendPhoneVerificationCode = authClient.sendPhoneVerificationCode;
export const signOutFromAuth = authClient.signOutFromAuth;
export const resetPhoneAuthFlow = authClient.resetPhoneAuthFlow;
