import { getCurrentAuthUser } from '../firebase/authClient';
import type { AppAuthUser } from '../firebase/authClient.types';
import { backendBaseUrl } from '../firebase/firebaseConfig';
const BACKEND_REQUEST_TIMEOUT_MS = 20_000;
const MAX_ERROR_MESSAGE_LENGTH = 220;

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

function createRequestSignal(
  timeoutMs: number,
  externalSignal?: AbortSignal | null
) {
  const controller = new AbortController();
  const abortFromExternalSignal = () => controller.abort();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', abortFromExternalSignal, {
        once: true,
      });
    }
  }

  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timeoutId);

      if (externalSignal) {
        externalSignal.removeEventListener('abort', abortFromExternalSignal);
      }
    },
  };
}

function getFetchFailureMessage(path: string, error: unknown) {
  const timeoutMessage = `Backend request timed out after ${Math.ceil(
    BACKEND_REQUEST_TIMEOUT_MS / 1000
  )}s for ${path}.`;

  if (error instanceof Error) {
    const normalized = error.message.toLowerCase();

    if (
      error.name === 'AbortError' ||
      normalized.includes('aborted') ||
      normalized.includes('timed out') ||
      normalized.includes('timeout')
    ) {
      return timeoutMessage;
    }

    return `Could not reach backend ${path}: ${error.message}`;
  }

  return `Could not reach backend ${path}.`;
}

function resolveAuthUser(preferredUser?: AppAuthUser | null) {
  const currentAuthUser = getCurrentAuthUser();

  if (preferredUser && currentAuthUser && preferredUser.uid === currentAuthUser.uid) {
    return currentAuthUser;
  }

  return currentAuthUser ?? preferredUser ?? null;
}

function isInvalidOrExpiredFirebaseTokenMessage(message: string) {
  return message.toLowerCase().includes('invalid or expired firebase token');
}

function normalizeErrorText(value: string) {
  const normalized = value.replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return null;
  }

  if (
    normalized.startsWith('<!DOCTYPE') ||
    normalized.startsWith('<!doctype') ||
    normalized.startsWith('<html')
  ) {
    return null;
  }

  return normalized.length > MAX_ERROR_MESSAGE_LENGTH
    ? `${normalized.slice(0, MAX_ERROR_MESSAGE_LENGTH - 3)}...`
    : normalized;
}

export function readErrorMessage(value: unknown): string | null {
  if (value instanceof Error) {
    return readErrorMessage(value.message) ?? value.name;
  }

  if (typeof value === 'string') {
    return normalizeErrorText(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = readErrorMessage(item);

      if (message) {
        return message;
      }
    }

    return null;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;

  for (const key of ['message', 'error', 'detail', 'title', 'reason']) {
    const message = readErrorMessage(record[key]);

    if (message) {
      return message;
    }
  }

  for (const key of ['errors', 'details', 'issues']) {
    const message = readErrorMessage(record[key]);

    if (message) {
      return message;
    }
  }

  return null;
}

function getErrorMessage(payload: unknown, fallback: string) {
  return readErrorMessage(payload) ?? fallback;
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
      'Backend URL is not configured. Set EXPO_PUBLIC_BACKEND_URL or embed it in app config.'
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
  const {
    authRequired: _authRequired,
    authUser: _authUser,
    headers: _requestHeaders,
    signal: externalSignal,
    ...fetchOptions
  } = options;

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

    const { signal, cleanup } = createRequestSignal(
      BACKEND_REQUEST_TIMEOUT_MS,
      externalSignal
    );

    try {
      return await fetch(`${backendBaseUrl}${path}`, {
        ...fetchOptions,
        headers: requestHeaders,
        signal,
      });
    } catch (error) {
      throw new BackendRequestError({
        message: getFetchFailureMessage(path, error),
        status: null,
        path,
        payload: error,
      });
    } finally {
      cleanup();
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
