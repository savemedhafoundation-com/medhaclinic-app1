import { ensureDataConnectAuthReady } from '../firebase/authClient';
import type { AppAuthUser } from '../firebase/authClient.types';

import {
  createWeeklyReport,
  getCurrentUser,
  getMyDailyImmunityHistory,
  medhaDataConnect,
  submitDailyImmunity,
  type GetMyDailyImmunityHistoryData,
  type SubmitDailyImmunityVariables,
  upsertCurrentUser,
  upsertMyProfile,
} from '../firebase/dataConnect';
import { hasConfiguredBackend, requestBackend } from './backend';

export type HealthProfileInput = {
  fullName: string;
  email?: string;
  gender?: string | null;
  age?: string;
  weight?: string;
  height?: string;
  purpose?: string | null;
  address?: string;
};

type Trend = 'up' | 'down' | 'same';

type CategoryKey =
  | 'energyLevels'
  | 'digestiveHealth'
  | 'cardiovascular'
  | 'immuneResponse'
  | 'respiratory'
  | 'hormonalHealth';

type DailySubmission = NonNullable<
  NonNullable<GetMyDailyImmunityHistoryData['user']>['submissions'][number]
>;

type CurrentUserDataLike = {
  user?: {
    profile?: Record<string, unknown> | null;
  } | null;
} | null;

export type WeeklyReportStatus = {
  success: boolean;
  message: string;
  currentReportDate: string;
  previousReportDate: string;
  currentScores: Record<CategoryKey, number>;
  previousScores: Record<CategoryKey, number>;
  scoreDifference: Record<
    CategoryKey,
    {
      current: number;
      previous: number;
      difference: number;
      trend: Trend;
    }
  >;
  overall: {
    current: number;
    previous: number;
    difference: number;
    trend: Trend;
  };
};

const CATEGORY_MAP: Record<CategoryKey, Array<keyof DailySubmission>> = {
  energyLevels: ['physicalEnergy'],
  digestiveHealth: ['appetite', 'digestionComfort', 'burningPain', 'bloatingGas'],
  cardiovascular: ['bloodPressure', 'swelling'],
  immuneResponse: ['fever', 'infection', 'immunityScore'],
  respiratory: ['breathingProblem'],
  hormonalHealth: [
    'menstrualRegularity',
    'libidoStability',
    'hairHealth',
    'sleepHours',
  ],
};

function parseOptionalInt(value?: string) {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalFloat(value?: string) {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function subDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - days);
  return copy;
}

function round1(value: number) {
  return Number(value.toFixed(1));
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return round1(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function trendForDifference(difference: number): Trend {
  if (difference > 0.1) {
    return 'up';
  }

  if (difference < -0.1) {
    return 'down';
  }

  return 'same';
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function hasNumericValue(value: DailySubmission[keyof DailySubmission]): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function categoryAverage(
  submissions: DailySubmission[],
  fields: Array<keyof DailySubmission>
) {
  const values: number[] = [];

  for (const submission of submissions) {
    for (const field of fields) {
      const value = submission[field];
      if (hasNumericValue(value)) {
        values.push(value);
      }
    }
  }

  return average(values);
}

export function hasCompletedHealthProfile(
  currentUserData: CurrentUserDataLike | null | undefined
) {
  return Boolean(currentUserData?.user?.profile);
}

function getAuthProvider(user: AppAuthUser) {
  if (user.phoneNumber && !user.email) {
    return 'phone';
  }

  if (user.email) {
    return 'google';
  }

  return 'firebase';
}

export async function syncAuthenticatedUser(user: AppAuthUser) {
  if (hasConfiguredBackend()) {
    await requestBackend('/v1/me', {
      method: 'GET',
      authUser: user,
    });
    return;
  }

  await ensureDataConnectAuthReady(user);

  await upsertCurrentUser(medhaDataConnect, {
    name: user.displayName ?? undefined,
    email: user.email ?? undefined,
    photoUrl: user.photoURL ?? undefined,
    provider: getAuthProvider(user),
  });
}

export async function getCurrentUserData() {
  if (hasConfiguredBackend()) {
    const response = await requestBackend<{
      data?: {
        profile?: Record<string, unknown> | null;
      } | null;
    }>('/v1/me');

    return {
      user: response.data ?? null,
    };
  }

  await ensureDataConnectAuthReady();

  const { data } = await getCurrentUser(medhaDataConnect);
  return data;
}

export async function saveHealthProfile(input: HealthProfileInput) {
  if (hasConfiguredBackend()) {
    await requestBackend('/v1/me/profile', {
      method: 'PUT',
      body: JSON.stringify({
        fullName: input.fullName || undefined,
        email: input.email || undefined,
        gender: input.gender ?? undefined,
        age: parseOptionalInt(input.age),
        weightKg: parseOptionalFloat(input.weight),
        heightCm: parseOptionalFloat(input.height),
        purpose: input.purpose ?? undefined,
        address: input.address?.trim() || undefined,
      }),
    });
    return;
  }

  await ensureDataConnectAuthReady();

  await upsertCurrentUser(medhaDataConnect, {
    name: input.fullName || undefined,
    email: input.email || undefined,
  });

  await upsertMyProfile(medhaDataConnect, {
    gender: input.gender ?? undefined,
    age: parseOptionalInt(input.age),
    weightKg: parseOptionalFloat(input.weight),
    heightCm: parseOptionalFloat(input.height),
    purpose: input.purpose ?? undefined,
    address: input.address?.trim() || undefined,
  });
}

export async function saveDailyImmunitySubmission(
  input: SubmitDailyImmunityVariables
) {
  if (hasConfiguredBackend()) {
    return requestBackend('/api/auth/save_daily_immunity', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  await ensureDataConnectAuthReady();

  return submitDailyImmunity(medhaDataConnect, input);
}

export async function buildAndStoreWeeklyReport() {
  if (hasConfiguredBackend()) {
    const response = await requestBackend<{
      data?: WeeklyReportStatus;
    }>('/v1/reports/weekly/generate', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    if (!response.data) {
      throw new Error('Invalid weekly report response from backend.');
    }

    return response.data;
  }

  await ensureDataConnectAuthReady();

  const { data } = await getMyDailyImmunityHistory(medhaDataConnect);
  const submissions = [...(data.user?.submissions ?? [])].sort(
    (left, right) =>
      new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime()
  );

  const now = new Date();
  const currentStart = startOfDay(subDays(now, 6));
  const previousStart = startOfDay(subDays(now, 13));
  const previousEnd = currentStart;

  const currentSubmissions = submissions.filter(
    submission => new Date(submission.submittedAt) >= currentStart
  );
  const previousSubmissions = submissions.filter(submission => {
    const submittedAt = new Date(submission.submittedAt);
    return submittedAt >= previousStart && submittedAt < previousEnd;
  });

  const currentScores = {} as Record<CategoryKey, number>;
  const previousScores = {} as Record<CategoryKey, number>;
  const scoreDifference = {} as WeeklyReportStatus['scoreDifference'];

  for (const [category, fields] of Object.entries(CATEGORY_MAP) as Array<
    [CategoryKey, Array<keyof DailySubmission>]
  >) {
    const current = categoryAverage(currentSubmissions, fields);
    const previous = categoryAverage(previousSubmissions, fields);
    const difference = round1(current - previous);

    currentScores[category] = current;
    previousScores[category] = previous;
    scoreDifference[category] = {
      current,
      previous,
      difference,
      trend: trendForDifference(difference),
    };
  }

  const overallCurrent = average(Object.values(currentScores));
  const overallPrevious = average(Object.values(previousScores));
  const overallDifference = round1(overallCurrent - overallPrevious);

  const report: WeeklyReportStatus = {
    success: true,
    message:
      currentSubmissions.length > 0
        ? 'Weekly report fetched successfully.'
        : 'No submissions found in the current week. Returning an empty report.',
    currentReportDate: currentStart.toISOString(),
    previousReportDate: previousStart.toISOString(),
    currentScores,
    previousScores,
    scoreDifference,
    overall: {
      current: overallCurrent,
      previous: overallPrevious,
      difference: overallDifference,
      trend: trendForDifference(overallDifference),
    },
  };

  await createWeeklyReport(medhaDataConnect, {
    weekStart: toIsoDate(currentStart),
    weekEnd: toIsoDate(now),
    overallCurrent: report.overall.current,
    overallPrevious: report.overall.previous,
    overallDelta: report.overall.difference,
    trend: report.overall.trend,
    summary: report.message,
    payload: report,
  });

  return report;
}
