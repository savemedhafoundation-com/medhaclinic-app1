import { getCurrentAuthUser } from '../firebase/authClient';
import type { AppAuthUser } from '../firebase/authClient.types';

const backendBaseUrl = process.env.EXPO_PUBLIC_BACKEND_URL?.trim()?.replace(
  /\/+$/,
  ''
);

export class BackendRequestError extends Error {
  status: number | null;
  path: string;
  payload: unknown;

  constructor({
    message,
    status,
    path,
    payload = null,
  }: {
    message: string;
    status: number | null;
    path: string;
    payload?: unknown;
  }) {
    super(message);
    this.name = 'BackendRequestError';
    this.status = status;
    this.path = path;
    this.payload = payload;
  }
}

type BackendRequestOptions = RequestInit & {
  authRequired?: boolean;
  authUser?: AppAuthUser | null;
};

function resolveAuthUser(preferredUser?: AppAuthUser | null) {
  const currentAuthUser = getCurrentAuthUser();

  if (preferredUser && currentAuthUser && preferredUser.uid === currentAuthUser.uid) {
    return currentAuthUser;
  }

  return currentAuthUser ?? preferredUser ?? null;
}

function isInvalidOrExpiredFirebaseTokenMessage(message: string) {
  return message.trim().toLowerCase() === 'invalid or expired firebase token.';
}

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

export function shouldFallbackToDataConnect(error: unknown) {
  if (error instanceof BackendRequestError) {
    return (
      error.status === null ||
      error.status === 404 ||
      error.status >= 500 ||
      (error.status === 401 &&
        isInvalidOrExpiredFirebaseTokenMessage(error.message))
    );
  }

  return false;
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

  let authUser = options.authRequired !== false
    ? resolveAuthUser(options.authUser)
    : null;

  if (options.authRequired !== false && !authUser) {
    throw new Error('Please sign in before contacting the backend.');
  }

  async function performFetch(forceRefreshToken = false) {
    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    authUser = options.authRequired !== false ? resolveAuthUser(authUser) : null;

    if (options.authRequired !== false && !authUser) {
      throw new Error('Please sign in before contacting the backend.');
    }

    if (authUser) {
      const token = await authUser.getIdToken(forceRefreshToken);
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    try {
      return await fetch(`${backendBaseUrl}${path}`, {
        ...options,
        headers: requestHeaders,
      });
    } catch (error) {
      throw new BackendRequestError({
        message:
          error instanceof Error
            ? error.message
            : 'Backend request failed before reaching the server.',
        status: null,
        path,
        payload: error,
      });
    }
  }

  let response = await performFetch();

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
    if (response.status === 401 && authUser) {
      response = await performFetch(true);

      const retryResponseText = await response.text();
      let retryPayload: unknown = null;

      if (retryResponseText) {
        try {
          retryPayload = JSON.parse(retryResponseText);
        } catch {
          retryPayload = retryResponseText;
        }
      }

      if (response.ok) {
        return retryPayload as T;
      }

      payload = retryPayload;
    }

    throw new BackendRequestError({
      message: getErrorMessage(
        payload,
        `Backend request failed with status ${response.status}.`
      ),
      status: response.status,
      path,
      payload,
    });
  }

  return payload as T;
}
