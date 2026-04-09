import { Platform } from 'react-native';

import {
  ensureDataConnectAuthReady,
  getCurrentAuthUser,
} from '../firebase/authClient';
import type { AppAuthUser } from '../firebase/authClient.types';
import {
  type CreateWeeklyReportData,
  type CreateWeeklyReportVariables,
  connectorConfig,
  type GetCurrentUserData,
  type SubmitDailyImmunityData,
  type UpsertMyProfileData,
  type UpsertMyProfileVariables,
  type UpsertCurrentUserData,
  type UpsertCurrentUserVariables,
} from '../firebase/dataconnect-generated';
import {
  firebaseConfig,
  firebaseDataConnectEmulatorHost,
} from '../firebase/firebaseConfig';

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
import type {
  ImmunityAssessmentResult,
  SystemScoreKey,
} from './immunityScoring';
import {
  hasConfiguredBackend,
  requestBackend,
  shouldFallbackToDataConnect,
} from './backend';

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
  daysTracked?: number;
  currentScores: Record<CategoryKey, number>;
  previousScores: Record<CategoryKey, number>;
  scoreDifference: Record<
    CategoryKey,
    {
      current: number;
      previous: number;
      difference: number;
      trend: Trend;
      currentSampleCount?: number;
      previousSampleCount?: number;
    }
  >;
  overall: {
    current: number;
    previous: number;
    difference: number;
    trend: Trend;
    currentSubmissionCount?: number;
    previousSubmissionCount?: number;
  };
  currentWindow?: {
    startDate: string;
    endDate: string;
    submissionCount: number;
    trackedDayCount: number;
    latestSubmissionAt: string | null;
    days: Array<{
      date: string;
      submissionCount: number;
      averageImmunityScore: number | null;
      representativeLevel: string | null;
      categoryScores: Record<string, number | null>;
    }>;
  };
  previousWindow?: {
    startDate: string;
    endDate: string;
    submissionCount: number;
    trackedDayCount: number;
    latestSubmissionAt: string | null;
    days: Array<{
      date: string;
      submissionCount: number;
      averageImmunityScore: number | null;
      representativeLevel: string | null;
      categoryScores: Record<string, number | null>;
    }>;
  };
  strongestCategory?: {
    key: string;
    label: string;
    score: number;
    sampleCount: number;
  } | null;
  weakestCategory?: {
    key: string;
    label: string;
    score: number;
    sampleCount: number;
  } | null;
  insights?: {
    overview: string;
    overallProgress: string;
    areasToImprove: string;
    encouragement: string;
    categoryInsights: Record<string, string>;
    generationSource: 'openai' | 'fallback';
  };
};

type AssessmentSystemSummary = {
  key: SystemScoreKey;
  score: number;
} | null;

export type AuthoritativeImmunityAssessment = ImmunityAssessmentResult & {
  apiLevel?: string;
};

type BackendDailyImmunitySubmissionResponse = {
  success?: boolean;
  message?: string;
  assessment?: AuthoritativeImmunityAssessment | null;
};

export type LatestDailyImmunitySummary = {
  immunityScore: number;
  immunityLevel: string | null;
  submittedAt: string | null;
};

const CATEGORY_MAP: Record<CategoryKey, (keyof DailySubmission)[]> = {
  energyLevels: ['physicalEnergy', 'sleepHours'],
  digestiveHealth: ['appetite', 'digestionComfort', 'bloatingGas'],
  cardiovascular: ['bloodPressure'],
  immuneResponse: ['fever', 'infection', 'swelling'],
  respiratory: ['breathingProblem'],
  hormonalHealth: ['menstrualRegularity', 'libidoStability'],
};

function resolveSignedInUser(authUser?: AppAuthUser | null) {
  const currentAuthUser = getCurrentAuthUser();

  if (authUser && currentAuthUser && authUser.uid === currentAuthUser.uid) {
    return currentAuthUser;
  }

  return currentAuthUser ?? authUser ?? null;
}

function isAssessmentSystemSummary(value: unknown): value is AssessmentSystemSummary {
  if (value === null) {
    return true;
  }

  if (!value || typeof value !== 'object') {
    return false;
  }

  return (
    'key' in value &&
    typeof value.key === 'string' &&
    'score' in value &&
    typeof value.score === 'number'
  );
}

function isAssessmentSystemScoreRecord(
  value: unknown
): value is Record<SystemScoreKey, number | null> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  const keys: SystemScoreKey[] = [
    'digestive',
    'immune',
    'energy',
    'cardiovascular',
    'respiratory',
    'hormonal',
  ];

  return keys.every(key => {
    const score = record[key];
    return score === null || typeof score === 'number';
  });
}

export function readAuthoritativeImmunityAssessment(
  payload: unknown
): AuthoritativeImmunityAssessment | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const response = payload as BackendDailyImmunitySubmissionResponse;
  const assessment = response.assessment;

  if (!assessment || typeof assessment !== 'object') {
    return null;
  }

  if (
    typeof assessment.immunityScore !== 'number' ||
    typeof assessment.roundedScore !== 'number' ||
    typeof assessment.level !== 'string' ||
    typeof assessment.baseWeightedScore !== 'number' ||
    typeof assessment.penaltyApplied !== 'number' ||
    !Array.isArray(assessment.answeredParameters) ||
    !isAssessmentSystemScoreRecord(assessment.systemScores) ||
    !isAssessmentSystemSummary(assessment.weakestSystem) ||
    !isAssessmentSystemSummary(assessment.strongestSystem)
  ) {
    return null;
  }

  return assessment;
}

function readLatestDailyImmunitySummary(
  payload: unknown
): LatestDailyImmunitySummary | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.immunityScore !== 'number') {
    return null;
  }

  return {
    immunityScore: record.immunityScore,
    immunityLevel:
      typeof record.immunityLevel === 'string' ? record.immunityLevel : null,
    submittedAt: typeof record.submittedAt === 'string' ? record.submittedAt : null,
  };
}

function getLatestDailyImmunityFromSubmissions(
  submissions: DailySubmission[]
): LatestDailyImmunitySummary | null {
  const latestSubmission = [...submissions].sort(
    (left, right) =>
      new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime()
  )[0];

  if (!latestSubmission || typeof latestSubmission.immunityScore !== 'number') {
    return null;
  }

  return {
    immunityScore: latestSubmission.immunityScore,
    immunityLevel:
      typeof latestSubmission.immunityLevel === 'string'
        ? latestSubmission.immunityLevel
        : null,
    submittedAt:
      typeof latestSubmission.submittedAt === 'string'
        ? latestSubmission.submittedAt
        : null,
  };
}

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
  fields: (keyof DailySubmission)[]
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

function buildUpsertCurrentUserVariables(
  user: AppAuthUser,
  overrides: Partial<UpsertCurrentUserVariables> = {}
): UpsertCurrentUserVariables {
  return {
    name:
      overrides.name !== undefined ? overrides.name : user.displayName ?? undefined,
    email:
      overrides.email !== undefined ? overrides.email : user.email ?? undefined,
    photoUrl:
      overrides.photoUrl !== undefined
        ? overrides.photoUrl
        : user.photoURL ?? undefined,
    provider:
      overrides.provider !== undefined
        ? overrides.provider
        : getAuthProvider(user),
  };
}

function getDataConnectConnectorPath() {
  return `projects/${firebaseConfig.projectId}/locations/${connectorConfig.location}/services/${connectorConfig.service}/connectors/${connectorConfig.connector}`;
}

function getDataConnectMutationUrl() {
  const emulatorHost = firebaseDataConnectEmulatorHost;

  if (emulatorHost) {
    const baseUrl =
      emulatorHost.startsWith('http://') || emulatorHost.startsWith('https://')
        ? emulatorHost
        : `http://${emulatorHost}`;

    return `${baseUrl}/v1/${getDataConnectConnectorPath()}:executeMutation`;
  }

  return `https://firebasedataconnect.googleapis.com/v1/${getDataConnectConnectorPath()}:executeMutation?key=${encodeURIComponent(firebaseConfig.apiKey)}`;
}

function getDataConnectQueryUrl() {
  const emulatorHost = firebaseDataConnectEmulatorHost;

  if (emulatorHost) {
    const baseUrl =
      emulatorHost.startsWith('http://') || emulatorHost.startsWith('https://')
        ? emulatorHost
        : `http://${emulatorHost}`;

    return `${baseUrl}/v1/${getDataConnectConnectorPath()}:executeQuery`;
  }

  return `https://firebasedataconnect.googleapis.com/v1/${getDataConnectConnectorPath()}:executeQuery?key=${encodeURIComponent(firebaseConfig.apiKey)}`;
}

function getDataConnectErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object') {
    if ('message' in payload && typeof payload.message === 'string') {
      return payload.message;
    }

    if ('errors' in payload && Array.isArray(payload.errors)) {
      for (const error of payload.errors) {
        if (
          error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof error.message === 'string'
        ) {
          return error.message;
        }
      }
    }
  }

  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  return fallback;
}

async function executeDataConnectMutationDirect<T, TVariables extends object>(
  operationName: string,
  variables: TVariables,
  authUser?: AppAuthUser | null
) {
  let signedInUser = resolveSignedInUser(authUser);

  if (!signedInUser) {
    throw new Error('Please sign in again before submitting your daily immunity check.');
  }

  const connectorPath = getDataConnectConnectorPath();
  async function performRequest(forceRefreshToken = false) {
    signedInUser = resolveSignedInUser(signedInUser);

    if (!signedInUser) {
      throw new Error(
        'Please sign in again before submitting your daily immunity check.'
      );
    }

    const token = await signedInUser.getIdToken(forceRefreshToken);

    return fetch(getDataConnectMutationUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Firebase-Auth-Token': token,
        'x-firebase-gmpid': firebaseConfig.appId,
      },
      body: JSON.stringify({
        name: connectorPath,
        operationName,
        variables,
      }),
    });
  }

  let response = await performRequest();

  async function readResponsePayload(currentResponse: Response) {
    const responseText = await currentResponse.text();
    let payload: unknown = null;

    if (responseText) {
      try {
        payload = JSON.parse(responseText) as unknown;
      } catch {
        payload = responseText;
      }
    }

    return payload;
  }

  let payload = await readResponsePayload(response);

  if (!response.ok && (response.status === 401 || response.status === 403)) {
    response = await performRequest(true);
    payload = await readResponsePayload(response);
  }

  if (!response.ok) {
    throw new Error(
      getDataConnectErrorMessage(
        payload,
        `Data Connect request failed with status ${response.status}.`
      )
    );
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'errors' in payload &&
    Array.isArray(payload.errors) &&
    payload.errors.length > 0
  ) {
    throw new Error(
      getDataConnectErrorMessage(payload, 'Data Connect rejected the mutation.')
    );
  }

  return payload as { data?: T | null };
}

async function executeDataConnectQueryDirect<
  TData,
  TVariables extends object | undefined = undefined,
>(
  operationName: string,
  variables?: TVariables,
  authUser?: AppAuthUser | null
) {
  let signedInUser = resolveSignedInUser(authUser);

  if (!signedInUser) {
    throw new Error('Please sign in again before loading your data.');
  }

  const connectorPath = getDataConnectConnectorPath();
  async function performRequest(forceRefreshToken = false) {
    signedInUser = resolveSignedInUser(signedInUser);

    if (!signedInUser) {
      throw new Error('Please sign in again before loading your data.');
    }

    const token = await signedInUser.getIdToken(forceRefreshToken);

    return fetch(getDataConnectQueryUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Firebase-Auth-Token': token,
        'x-firebase-gmpid': firebaseConfig.appId,
      },
      body: JSON.stringify({
        name: connectorPath,
        operationName,
        variables,
      }),
    });
  }

  let response = await performRequest();

  async function readResponsePayload(currentResponse: Response) {
    const responseText = await currentResponse.text();
    let payload: unknown = null;

    if (responseText) {
      try {
        payload = JSON.parse(responseText) as unknown;
      } catch {
        payload = responseText;
      }
    }

    return payload;
  }

  let payload = await readResponsePayload(response);

  if (!response.ok && (response.status === 401 || response.status === 403)) {
    response = await performRequest(true);
    payload = await readResponsePayload(response);
  }

  if (!response.ok) {
    throw new Error(
      getDataConnectErrorMessage(
        payload,
        `Data Connect request failed with status ${response.status}.`
      )
    );
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'errors' in payload &&
    Array.isArray(payload.errors) &&
    payload.errors.length > 0
  ) {
    throw new Error(
      getDataConnectErrorMessage(payload, 'Data Connect rejected the query.')
    );
  }

  return payload as { data?: TData | null };
}

async function ensureDirectCurrentUserRecord(authUser?: AppAuthUser | null) {
  const signedInUser = resolveSignedInUser(authUser);

  if (!signedInUser) {
    throw new Error('Please sign in again before submitting your daily immunity check.');
  }

  await executeDataConnectMutationDirect<
    UpsertCurrentUserData,
    UpsertCurrentUserVariables
  >('UpsertCurrentUser', buildUpsertCurrentUserVariables(signedInUser), signedInUser);

  return signedInUser;
}

export async function syncAuthenticatedUser(user: AppAuthUser) {
  if (hasConfiguredBackend()) {
    try {
      await requestBackend('/v1/me', {
        method: 'GET',
        authUser: user,
      });
      return;
    } catch (error) {
      if (!shouldFallbackToDataConnect(error)) {
        throw error;
      }
    }
  }

  if (Platform.OS !== 'web') {
    await executeDataConnectMutationDirect<
      UpsertCurrentUserData,
      UpsertCurrentUserVariables
    >('UpsertCurrentUser', buildUpsertCurrentUserVariables(user), user);
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
    try {
      const response = await requestBackend<{
        data?: {
          profile?: Record<string, unknown> | null;
        } | null;
      }>('/v1/me');

      return {
        user: response.data ?? null,
      };
    } catch (error) {
      if (!shouldFallbackToDataConnect(error)) {
        throw error;
      }
    }
  }

  if (Platform.OS !== 'web') {
    const signedInUser = await ensureDirectCurrentUserRecord();
    const response = await executeDataConnectQueryDirect<GetCurrentUserData>(
      'GetCurrentUser',
      undefined,
      signedInUser
    );

    return response.data;
  }

  await ensureDataConnectAuthReady();

  const { data } = await getCurrentUser(medhaDataConnect);
  return data;
}

export async function saveHealthProfile(input: HealthProfileInput) {
  if (hasConfiguredBackend()) {
    try {
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
    } catch (error) {
      if (!shouldFallbackToDataConnect(error)) {
        throw error;
      }
    }
  }

  if (Platform.OS !== 'web') {
    const signedInUser = await ensureDirectCurrentUserRecord();

    await executeDataConnectMutationDirect<
      UpsertCurrentUserData,
      UpsertCurrentUserVariables
    >(
      'UpsertCurrentUser',
      buildUpsertCurrentUserVariables(signedInUser, {
        name: input.fullName || undefined,
        email: input.email || undefined,
      }),
      signedInUser
    );

    await executeDataConnectMutationDirect<
      UpsertMyProfileData,
      UpsertMyProfileVariables
    >(
      'UpsertMyProfile',
      {
        gender: input.gender ?? undefined,
        age: parseOptionalInt(input.age),
        weightKg: parseOptionalFloat(input.weight),
        heightCm: parseOptionalFloat(input.height),
        purpose: input.purpose ?? undefined,
        address: input.address?.trim() || undefined,
      },
      signedInUser
    );
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

export async function saveCurrentUserPhotoUrl(
  photoUrl: string,
  authUser?: AppAuthUser | null
) {
  const signedInUser = authUser ?? getCurrentAuthUser();

  if (!signedInUser) {
    throw new Error('Please sign in again before updating your profile photo.');
  }

  if (hasConfiguredBackend()) {
    try {
      await requestBackend('/v1/me/photo', {
        method: 'PUT',
        body: JSON.stringify({ photoUrl }),
        authUser: signedInUser,
      });
      return;
    } catch (error) {
      if (!shouldFallbackToDataConnect(error)) {
        throw error;
      }
    }
  }

  if (Platform.OS !== 'web') {
    const currentUser = await ensureDirectCurrentUserRecord(signedInUser);

    await executeDataConnectMutationDirect<
      UpsertCurrentUserData,
      UpsertCurrentUserVariables
    >(
      'UpsertCurrentUser',
      buildUpsertCurrentUserVariables(currentUser, { photoUrl }),
      currentUser
    );
    return;
  }

  await ensureDataConnectAuthReady(signedInUser);

  await upsertCurrentUser(
    medhaDataConnect,
    buildUpsertCurrentUserVariables(signedInUser, { photoUrl })
  );
}

export async function saveDailyImmunitySubmission(
  input: SubmitDailyImmunityVariables,
  authUser?: AppAuthUser | null
) {
  if (hasConfiguredBackend()) {
    try {
      return await requestBackend<BackendDailyImmunitySubmissionResponse>(
        '/v1/immunity/daily',
        {
          method: 'POST',
          body: JSON.stringify(input),
          authUser,
        }
      );
    } catch (error) {
      if (!shouldFallbackToDataConnect(error)) {
        throw error;
      }
    }
  }

  if (Platform.OS !== 'web') {
    const signedInUser = await ensureDirectCurrentUserRecord(authUser);

    return executeDataConnectMutationDirect<SubmitDailyImmunityData, SubmitDailyImmunityVariables>(
      'SubmitDailyImmunity',
      input,
      signedInUser
    );
  }

  await ensureDataConnectAuthReady(authUser);

  return submitDailyImmunity(medhaDataConnect, input);
}

export async function getLatestDailyImmunitySummary() {
  if (hasConfiguredBackend()) {
    try {
      const response = await requestBackend<{
        data?: {
          immunityScore?: number;
          immunityLevel?: string | null;
          submittedAt?: string | null;
        } | null;
      }>('/v1/immunity/latest');

      return readLatestDailyImmunitySummary(response.data);
    } catch (error) {
      if (!shouldFallbackToDataConnect(error)) {
        throw error;
      }
    }
  }

  if (Platform.OS !== 'web') {
    const signedInUser = await ensureDirectCurrentUserRecord();
    const historyResponse =
      await executeDataConnectQueryDirect<GetMyDailyImmunityHistoryData>(
        'GetMyDailyImmunityHistory',
        undefined,
        signedInUser
      );

    return getLatestDailyImmunityFromSubmissions(
      historyResponse.data?.user?.submissions ?? []
    );
  }

  await ensureDataConnectAuthReady();

  const { data } = await getMyDailyImmunityHistory(medhaDataConnect);
  return getLatestDailyImmunityFromSubmissions(data.user?.submissions ?? []);
}

export async function buildAndStoreWeeklyReport() {
  if (hasConfiguredBackend()) {
    try {
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
    } catch (error) {
      if (!shouldFallbackToDataConnect(error)) {
        throw error;
      }
    }
  }

  if (Platform.OS !== 'web') {
    const signedInUser = await ensureDirectCurrentUserRecord();
    const historyResponse =
      await executeDataConnectQueryDirect<GetMyDailyImmunityHistoryData>(
        'GetMyDailyImmunityHistory',
        undefined,
        signedInUser
      );
    const submissions = [...(historyResponse.data?.user?.submissions ?? [])].sort(
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

    for (const [category, fields] of Object.entries(CATEGORY_MAP) as [
      CategoryKey,
      (keyof DailySubmission)[],
    ][]) {
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

    await executeDataConnectMutationDirect<
      CreateWeeklyReportData,
      CreateWeeklyReportVariables
    >(
      'CreateWeeklyReport',
      {
        weekStart: toIsoDate(currentStart),
        weekEnd: toIsoDate(now),
        overallCurrent: report.overall.current,
        overallPrevious: report.overall.previous,
        overallDelta: report.overall.difference,
        trend: report.overall.trend,
        summary: report.message,
        payload: report,
      },
      signedInUser
    );

    return report;
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

  for (const [category, fields] of Object.entries(CATEGORY_MAP) as [
    CategoryKey,
    (keyof DailySubmission)[],
  ][]) {
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
