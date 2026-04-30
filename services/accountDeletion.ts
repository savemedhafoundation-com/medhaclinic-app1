import type { AppAuthUser } from '../firebase/authClient.types';
import { hasConfiguredBackend, requestBackend } from './backend';
import { deleteCurrentUserProfilePhotos } from './profilePhoto';

export type AccountDeletionResult = {
  deleted: {
    account: boolean;
    profile: boolean;
    dailyImmunitySubmissions: number;
    weeklyReports: number;
    aiSummaries: number;
    savedAddresses: number;
    storeOrders: number;
  };
  retention: {
    hasExceptions: boolean;
    message: string;
    exceptions: string[];
  };
};

type AccountDeletionResponse = {
  success: boolean;
  message?: string;
  data?: AccountDeletionResult;
};

export async function deleteCurrentAccount(authUser: AppAuthUser) {
  if (!hasConfiguredBackend()) {
    throw new Error(
      'Account deletion is unavailable because the secure backend service is not configured.'
    );
  }

  await deleteCurrentUserProfilePhotos(authUser);

  const response = await requestBackend<AccountDeletionResponse>('/v1/me', {
    method: 'DELETE',
    authUser,
  });

  return response.data ?? null;
}
