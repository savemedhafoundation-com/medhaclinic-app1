import type { AppAuthUser } from '../firebase/authClient.types';
import {
  BackendRequestError,
  getConfiguredBackendUrl,
  hasConfiguredBackend,
  readErrorMessage,
  requestBackend,
} from './backend';

const DEFAULT_PUBLIC_AI_BACKEND_URL = 'https://medhaclinic-app1.onrender.com';
const PUBLIC_AI_SUMMARY_PATH = '/v1/ai/immunity-summary-public';
const PUBLIC_AI_TIMEOUT_MS = 20_000;

function shouldUsePublicAiSummaryRoute(error: unknown) {
  return (
    error instanceof BackendRequestError &&
    (error.status === null || error.status === 401 || error.status >= 500)
  );
}

function shouldUseDefaultPublicBackend(error: unknown) {
  return (
    error instanceof BackendRequestError &&
    (error.status === null || error.status === 404 || error.status >= 500)
  );
}

function getPublicAiTimeoutMessage() {
  return `Public AI summary request timed out after ${Math.ceil(
    PUBLIC_AI_TIMEOUT_MS / 1000
  )}s.`;
}

function normalizeAiSummaryError(error: unknown) {
  if (error instanceof BackendRequestError) {
    if (typeof error.status === 'number' && error.status >= 500) {
      return new Error(
        `AI summary service is temporarily unavailable (HTTP ${error.status}).`
      );
    }

    return new Error(readErrorMessage(error.payload) ?? error.message);
  }

  if (error instanceof Error) {
    return new Error(readErrorMessage(error.message) ?? error.message);
  }

  return new Error(readErrorMessage(error) ?? 'AI summary request failed.');
}

function combineAiSummaryErrors(primaryError: unknown, fallbackError: unknown) {
  const primary = normalizeAiSummaryError(primaryError);
  const fallback = normalizeAiSummaryError(fallbackError);

  if (primary.message === fallback.message) {
    return primary;
  }

  return new Error(
    `${primary.message} Backup AI summary service also failed: ${fallback.message}`
  );
}

async function requestPublicAiSummary(baseUrl: string, promptText: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PUBLIC_AI_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/+$/, '')}${PUBLIC_AI_SUMMARY_PATH}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptText }),
        signal: controller.signal,
      }
    );

    const responseText = await response.text();
    let data: Record<string, unknown> | null = null;

    if (responseText) {
      try {
        data = JSON.parse(responseText) as Record<string, unknown>;
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      throw new Error(
        readErrorMessage(data) ??
          (response.status >= 500
            ? `AI summary service is temporarily unavailable (HTTP ${response.status}).`
            : readErrorMessage(responseText)) ??
          `AI request failed with status ${response.status}.`
      );
    }

    if (typeof data?.result !== 'string' || !data.result.trim()) {
      throw new Error('Invalid response from AI server');
    }

    return data.result;
  } catch (error) {
    if (error instanceof Error) {
      const normalized = error.message.toLowerCase();

      if (
        error.name === 'AbortError' ||
        normalized.includes('aborted') ||
        normalized.includes('timed out') ||
        normalized.includes('timeout')
      ) {
        throw new Error(getPublicAiTimeoutMessage());
      }

      throw error;
    }

    throw new Error(readErrorMessage(error) ?? 'Public AI summary request failed.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchImmunityResult(
  promptText: string,
  authUser?: AppAuthUser | null
) {
  try {
    if (!promptText) {
      throw new Error('Prompt is empty or undefined');
    }

    if (hasConfiguredBackend()) {
      let data: { result?: string } | null = null;
      const configuredBackendUrl = getConfiguredBackendUrl();

      if (authUser) {
        try {
          data = await requestBackend<{ result?: string }>(
            '/v1/ai/immunity-summary',
            {
              method: 'POST',
              body: JSON.stringify({ prompt: promptText }),
              authUser,
            }
          );
        } catch (error) {
          if (!shouldUsePublicAiSummaryRoute(error)) {
            throw error;
          }
        }
      }

      if (!data) {
        let configuredPublicRouteError: unknown = null;

        try {
          data = await requestBackend<{ result?: string }>(PUBLIC_AI_SUMMARY_PATH, {
            method: 'POST',
            body: JSON.stringify({ prompt: promptText }),
            authRequired: false,
          });
        } catch (error) {
          if (
            configuredBackendUrl === DEFAULT_PUBLIC_AI_BACKEND_URL ||
            !shouldUseDefaultPublicBackend(error)
          ) {
            throw error;
          }

          configuredPublicRouteError = error;
        }

        if (!data && configuredPublicRouteError) {
          try {
            return await requestPublicAiSummary(
              DEFAULT_PUBLIC_AI_BACKEND_URL,
              promptText
            );
          } catch (fallbackError) {
            throw combineAiSummaryErrors(
              configuredPublicRouteError,
              fallbackError
            );
          }
        }
      }

      if (!data.result) {
        throw new Error('Invalid response from AI server');
      }

      return data.result;
    }

    return requestPublicAiSummary(DEFAULT_PUBLIC_AI_BACKEND_URL, promptText);
  } catch (error) {
    throw normalizeAiSummaryError(error);
  }
}
