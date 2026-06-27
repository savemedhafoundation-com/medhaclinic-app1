import type { AppAuthUser } from '../firebase/authClient.types';
import { BackendRequestError, readErrorMessage, requestBackend } from './backend';
import type { AiContentSource } from './openai';

const PERSONALIZED_DIET_PATH = '/v1/ai/personalized-diet';
const PERSONALIZED_DIET_TIMEOUT_MS = 15_000;

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

export type PersonalizedDietPlanResult = {
  plan: PersonalizedDietPlan;
  source: AiContentSource;
  outputReference?: string | null;
};

function normalizeDietPlanError(error: unknown) {
  if (error instanceof BackendRequestError) {
    if (typeof error.status === 'number' && error.status >= 500) {
      return new Error(
        `Wellness plan service is temporarily unavailable (HTTP ${error.status}).`
      );
    }

    return new Error(readErrorMessage(error.payload) ?? error.message);
  }

  if (error instanceof Error) {
    return new Error(readErrorMessage(error.message) ?? error.message);
  }

  return new Error(readErrorMessage(error) ?? 'Wellness plan request failed.');
}

export function createLocalDietPlan(input: PersonalizedDietInput): PersonalizedDietPlan {
  const dietType = input.dietType || 'Mixed diet';
  const mealsPerDay = input.mealsPerDay || '3';
  const activityLevel = input.activityLevel || 'Light activity';
  const eatingHabits = input.eatingHabits || 'Moderate';

  return {
    title: '30-Day Wellness Support Plan',
    subtitle: `A practical ${dietType.toLowerCase()} plan for ${mealsPerDay} meals per day and ${activityLevel.toLowerCase()}.`,
    intro:
      'This plan focuses on simple meals, steady hydration, light routine support, and realistic daily consistency.',
    focusSummary: input.immunity?.level
      ? `Use this as everyday support for ${input.immunity.level.toLowerCase()} wellness signals through meals, hydration, rest, and gentle movement.`
      : 'Use this as everyday support through balanced meals, hydration, rest, and gentle movement.',
    mealCards: [
      {
        name: 'Morning Start',
        time: 'Breakfast',
        foods: ['Warm water', 'Vegetable poha or oats', 'Seasonal fruit'],
        boosterTip: 'Keep breakfast light but steady so your energy starts gently.',
        note: input.otherPreferences
          ? `Adjusted around your preference: ${input.otherPreferences}.`
          : null,
      },
      {
        name: 'Midday Balance',
        time: 'Lunch',
        foods: ['Dal or protein bowl', 'Rice or roti', 'Cooked vegetables', 'Salad or lemon water'],
        boosterTip: 'Add protein and cooked vegetables together for a more satisfying meal.',
        note: `This fits your ${eatingHabits.toLowerCase()} pattern.`,
      },
      {
        name: 'Evening Reset',
        time: 'Dinner',
        foods: ['Khichdi or light roti meal', 'Vegetable soup', 'Herbal tea'],
        boosterTip: 'Keep dinner lighter than lunch and finish it at a comfortable time.',
        note: null,
      },
    ],
    hydration: {
      target:
        'Aim for steady water intake through the day instead of drinking a large amount at once.',
      tips: [
        'Start with water after waking.',
        'Keep a bottle visible during work hours.',
        'Add lemon, mint, or cumin water if plain water feels difficult.',
      ],
    },
    avoid: {
      title: 'Keep These Limited',
      items: [
        'Very late heavy dinners',
        'Sugary drinks',
        'Deep-fried snacks on most days',
        'Long gaps between meals',
      ],
    },
    improvementTimeline: {
      title: '30-Day Progress Flow',
      phases: [
        {
          label: 'Days 1-7',
          detail: 'Set your meal timing, hydration rhythm, and sleep wind-down routine.',
        },
        {
          label: 'Days 8-20',
          detail: 'Repeat the meals that feel easiest and add light walking after meals.',
        },
        {
          label: 'Days 21-30',
          detail: 'Keep the strongest habits and reduce the foods that disturb your routine.',
        },
      ],
    },
    supportCards: [
      {
        title: 'Daily Routine Support',
        description: 'Small repeatable habits make the plan easier to follow across the month.',
        bullets: [
          'Keep meal timing steady.',
          'Add gentle movement most days.',
          'Use reminders for water and sleep.',
        ],
      },
      {
        title: 'Food-Based Support',
        description: 'Use familiar household foods to support energy and everyday wellness.',
        bullets: [
          'Include dal, pulses, paneer, eggs, or tofu based on preference.',
          'Add cooked vegetables daily.',
          'Choose fruit instead of sweet snacks when possible.',
        ],
      },
    ],
    caution:
      'This is general wellness support, not medical advice. Adjust portions and foods based on your comfort and professional guidance if needed.',
    acceptLabel: 'Add to Wellness Reminders',
  };
}

export async function fetchPersonalizedDietPlan(
  input: PersonalizedDietInput,
  authUser?: AppAuthUser | null
): Promise<PersonalizedDietPlanResult> {
  try {
    if (!authUser) {
      throw new Error('Please sign in before requesting a wellness plan.');
    }

    const data = await requestBackend<PersonalizedDietPlanResult>(
      PERSONALIZED_DIET_PATH,
      {
        method: 'POST',
        body: JSON.stringify(input),
        authUser,
        timeoutMs: PERSONALIZED_DIET_TIMEOUT_MS,
      }
    );

    if (!data?.plan) {
      throw new Error('Invalid response from wellness plan service.');
    }

    return {
      plan: data.plan,
      source: data.source === 'ai' ? 'ai' : 'template',
      outputReference: data.outputReference ?? null,
    };
  } catch (error) {
    console.log('Wellness plan service fallback:', normalizeDietPlanError(error).message);

    return {
      plan: createLocalDietPlan(input),
      source: 'template',
      outputReference: null,
    };
  }
}
