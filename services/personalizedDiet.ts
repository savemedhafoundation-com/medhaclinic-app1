import type { AppAuthUser } from '../firebase/authClient.types';
import {
  BackendRequestError,
  getConfiguredBackendUrl,
  hasConfiguredBackend,
  readErrorMessage,
  requestBackend,
} from './backend';

const PERSONALIZED_DIET_PATH = '/v1/ai/personalized-diet';
const PUBLIC_PERSONALIZED_DIET_PATH = '/v1/ai/personalized-diet-public';
const DEFAULT_PUBLIC_PERSONALIZED_DIET_BACKEND_URL =
  'https://medhaclinic-app1.onrender.com';
const PUBLIC_PERSONALIZED_DIET_TIMEOUT_MS = 45_000;

export type PersonalizedDietInput = {
  eatingHabits: string;
  mealsPerDay: string;
  activityLevel: string;
  dietType: string;
  otherPreferences?: string;
  patient?: {
    name?: string;
    age?: number;
    gender?: string;
  };
  immunity?: {
    score?: number;
    level?: string;
  };
};

export type PersonalizedDietPlan = {
  title: string;
  subtitle: string;
  intro: string;
  focusSummary: string;
  mealCards: Array<{
    name: string;
    time: string;
    foods: string[];
    boosterTip: string | null;
    note: string | null;
  }>;
  hydration: {
    target: string;
    tips: string[];
  };
  avoid: {
    title: string;
    items: string[];
  };
  improvementTimeline: {
    title: string;
    phases: Array<{
      label: string;
      detail: string;
    }>;
  };
  supportCards: Array<{
    title: string;
    description: string;
    bullets: string[];
  }>;
  caution: string;
  acceptLabel: string;
};

function shouldFallbackToPublicDietRoute(error: unknown) {
  return (
    error instanceof BackendRequestError &&
    (error.status === null || error.status === 401 || error.status >= 500)
  );
}

function shouldUseDefaultPublicDietBackend(error: unknown) {
  return (
    error instanceof BackendRequestError &&
    (error.status === null || error.status === 404 || error.status >= 500)
  );
}

function normalizeDietPlanError(error: unknown) {
  if (error instanceof BackendRequestError) {
    if (typeof error.status === 'number' && error.status >= 500) {
      return new Error(
        `Personalized diet service is temporarily unavailable (HTTP ${error.status}).`
      );
    }

    return new Error(readErrorMessage(error.payload) ?? error.message);
  }

  if (error instanceof Error) {
    return new Error(readErrorMessage(error.message) ?? error.message);
  }

  return new Error(readErrorMessage(error) ?? 'Personalized diet request failed.');
}

function combineDietPlanErrors(primaryError: unknown, fallbackError: unknown) {
  const primary = normalizeDietPlanError(primaryError);
  const fallback = normalizeDietPlanError(fallbackError);

  if (primary.message === fallback.message) {
    return primary;
  }

  return new Error(
    `${primary.message} Backup personalized diet service also failed: ${fallback.message}`
  );
}

function getPublicDietTimeoutMessage() {
  return `Public personalized diet request timed out after ${Math.ceil(
    PUBLIC_PERSONALIZED_DIET_TIMEOUT_MS / 1000
  )}s.`;
}

async function requestPublicPersonalizedDietPlan(
  baseUrl: string,
  input: PersonalizedDietInput
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    PUBLIC_PERSONALIZED_DIET_TIMEOUT_MS
  );

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/+$/, '')}${PUBLIC_PERSONALIZED_DIET_PATH}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
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
            ? `Personalized diet service is temporarily unavailable (HTTP ${response.status}).`
            : readErrorMessage(responseText)) ??
          `Personalized diet request failed with status ${response.status}.`
      );
    }

    if (!data?.plan || typeof data.plan !== 'object') {
      throw new Error('Invalid response from personalized diet service.');
    }

    return data.plan as PersonalizedDietPlan;
  } catch (error) {
    if (error instanceof Error) {
      const normalized = error.message.toLowerCase();

      if (
        error.name === 'AbortError' ||
        normalized.includes('aborted') ||
        normalized.includes('timed out') ||
        normalized.includes('timeout')
      ) {
        throw new Error(getPublicDietTimeoutMessage());
      }

      throw error;
    }

    throw new Error(
      readErrorMessage(error) ?? 'Public personalized diet request failed.'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchPersonalizedDietPlan(
  input: PersonalizedDietInput,
  authUser?: AppAuthUser | null
) {
  try {
    if (hasConfiguredBackend()) {
      let data: { plan?: PersonalizedDietPlan } | null = null;
      const configuredBackendUrl = getConfiguredBackendUrl();

      if (authUser) {
        try {
          data = await requestBackend<{ plan?: PersonalizedDietPlan }>(
            PERSONALIZED_DIET_PATH,
            {
              method: 'POST',
              body: JSON.stringify(input),
              authUser,
            }
          );
        } catch (error) {
          if (!shouldFallbackToPublicDietRoute(error)) {
            throw error;
          }
        }
      }

      if (!data) {
        let configuredPublicRouteError: unknown = null;

        try {
          data = await requestBackend<{ plan?: PersonalizedDietPlan }>(
            PUBLIC_PERSONALIZED_DIET_PATH,
            {
              method: 'POST',
              body: JSON.stringify(input),
              authRequired: false,
            }
          );
        } catch (error) {
          if (
            configuredBackendUrl === DEFAULT_PUBLIC_PERSONALIZED_DIET_BACKEND_URL ||
            !shouldUseDefaultPublicDietBackend(error)
          ) {
            throw error;
          }

          configuredPublicRouteError = error;
        }

        if (!data && configuredPublicRouteError) {
          try {
            return await requestPublicPersonalizedDietPlan(
              DEFAULT_PUBLIC_PERSONALIZED_DIET_BACKEND_URL,
              input
            );
          } catch (fallbackError) {
            throw combineDietPlanErrors(
              configuredPublicRouteError,
              fallbackError
            );
          }
        }
      }

      if (!data?.plan) {
        throw new Error('Invalid response from personalized diet service.');
      }

      return data.plan;
    }

    return requestPublicPersonalizedDietPlan(
      DEFAULT_PUBLIC_PERSONALIZED_DIET_BACKEND_URL,
      input
    );
  } catch (error) {
    throw normalizeDietPlanError(error);
  }
}
