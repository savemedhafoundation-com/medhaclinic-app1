import type { AppAuthUser } from '../firebase/authClient.types';
import {
  BackendRequestError,
  readErrorMessage,
  requestBackend,
} from './backend';

const PERSONALIZED_DIET_PATH = '/v1/ai/personalized-diet';
const PUBLIC_PERSONALIZED_DIET_PATH = '/v1/ai/personalized-diet-public';

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

export async function fetchPersonalizedDietPlan(
  input: PersonalizedDietInput,
  authUser?: AppAuthUser | null
) {
  try {
    let data: { plan?: PersonalizedDietPlan } | null = null;

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
      data = await requestBackend<{ plan?: PersonalizedDietPlan }>(
        PUBLIC_PERSONALIZED_DIET_PATH,
        {
          method: 'POST',
          body: JSON.stringify(input),
          authRequired: false,
        }
      );
    }

    if (!data.plan) {
      throw new Error('Invalid response from personalized diet service.');
    }

    return data.plan;
  } catch (error) {
    throw normalizeDietPlanError(error);
  }
}
