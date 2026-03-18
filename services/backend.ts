import { getCurrentAuthUser } from '../firebase/authClient';
import type { AppAuthUser } from '../firebase/authClient.types';

const backendBaseUrl = process.env.EXPO_PUBLIC_BACKEND_URL?.trim()?.replace(
  /\/+$/,
  ''
);

type BackendRequestOptions = RequestInit & {
  authRequired?: boolean;
  authUser?: AppAuthUser | null;
};

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object') {
    const message =
      'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : null;

    if (message) {
      return message;
    }
  }

  return fallback;
}

export function hasConfiguredBackend() {
  return Boolean(backendBaseUrl);
}

export function getConfiguredBackendUrl() {
  return backendBaseUrl ?? null;
}

export async function requestBackend<T>(
  path: string,
  options: BackendRequestOptions = {}
) {
  if (!backendBaseUrl) {
    throw new Error(
      'EXPO_PUBLIC_BACKEND_URL is not configured. Set it in the Expo app .env file.'
    );
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.authRequired !== false) {
    const authUser = options.authUser ?? getCurrentAuthUser();

    if (!authUser) {
      throw new Error('Please sign in before contacting the backend.');
    }

    const token = await authUser.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${backendBaseUrl}${path}`, {
    ...options,
    headers,
  });

  const responseText = await response.text();
  let payload: unknown = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = responseText;
    }
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        payload,
        `Backend request failed with status ${response.status}.`
      )
    );
  }

  return payload as T;
}
