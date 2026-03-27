import type { AppAuthUser } from '../firebase/authClient.types';
import {
  BackendRequestError,
  getConfiguredBackendUrl,
  hasConfiguredBackend,
  requestBackend,
} from './backend';

const DEFAULT_PUBLIC_AI_BACKEND_URL = 'https://medhaclinic-backend2.vercel.app';
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
    let data:
      | {
          error?: string;
          message?: string;
          result?: string;
        }
      | null = null;

    if (responseText) {
      try {
        data = JSON.parse(responseText) as {
          error?: string;
          message?: string;
          result?: string;
        };
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      throw new Error(
        data?.error ??
          data?.message ??
          `AI request failed with status ${response.status}.`
      );
    }

    if (!data?.result) {
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

    throw new Error('Public AI summary request failed.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchImmunityResult(
  promptText: string,
  authUser?: AppAuthUser | null
) {
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

        return requestPublicAiSummary(DEFAULT_PUBLIC_AI_BACKEND_URL, promptText);
      }
    }

    if (!data.result) {
      throw new Error('Invalid response from AI server');
    }

    return data.result;
  }

  return requestPublicAiSummary(DEFAULT_PUBLIC_AI_BACKEND_URL, promptText);
}
