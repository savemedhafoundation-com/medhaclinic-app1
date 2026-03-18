import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateWeeklyReportData {
  weeklyReport_upsert: WeeklyReport_Key;
}

export interface CreateWeeklyReportVariables {
  weekStart: DateString;
  weekEnd: DateString;
  overallCurrent: number;
  overallPrevious?: number | null;
  overallDelta?: number | null;
  trend: string;
  summary?: string | null;
  payload?: unknown | null;
}

export interface DailyImmunitySubmission_Key {
  id: UUIDString;
  __typename?: 'DailyImmunitySubmission_Key';
}

export interface GetCurrentUserData {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    photoUrl?: string | null;
    provider?: string | null;
    createdAt: TimestampString;
    lastLoginAt?: TimestampString | null;
    profile?: {
      gender?: string | null;
      age?: number | null;
      weightKg?: number | null;
      heightCm?: number | null;
      purpose?: string | null;
      address?: string | null;
      createdAt: TimestampString;
      updatedAt: TimestampString;
    };
  } & User_Key;
}

export interface GetMyDailyImmunityHistoryData {
  user?: {
    submissions: ({
      id: UUIDString;
      submittedDate: DateString;
      submittedAt: TimestampString;
      immunityScore: number;
      immunityLevel: string;
      physicalEnergy?: number | null;
      appetite?: number | null;
      digestionComfort?: number | null;
      burningPain?: number | null;
      bloatingGas?: number | null;
      bloodPressure?: number | null;
      swelling?: number | null;
      fever?: number | null;
      infection?: number | null;
      breathingProblem?: number | null;
      menstrualRegularity?: number | null;
      libidoStability?: number | null;
      hairHealth?: number | null;
      sleepHours?: number | null;
    } & DailyImmunitySubmission_Key)[];
  };
}

export interface GetMyWeeklyReportsData {
  user?: {
    reports: ({
      weekStart: DateString;
      weekEnd: DateString;
      overallCurrent: number;
      overallPrevious?: number | null;
      overallDelta?: number | null;
      trend: string;
      summary?: string | null;
      payload?: unknown | null;
      generatedAt: TimestampString;
    })[];
  };
}

export interface PatientProfile_Key {
  userId: string;
  __typename?: 'PatientProfile_Key';
}

export interface SubmitDailyImmunityData {
  dailyImmunitySubmission_insert: DailyImmunitySubmission_Key;
}

export interface SubmitDailyImmunityVariables {
  physicalEnergy?: number | null;
  appetite?: number | null;
  digestionComfort?: number | null;
  burningPain?: number | null;
  bloatingGas?: number | null;
  bloodPressure?: number | null;
  swelling?: number | null;
  fever?: number | null;
  infection?: number | null;
  breathingProblem?: number | null;
  menstrualRegularity?: number | null;
  libidoStability?: number | null;
  hairHealth?: number | null;
  sleepHours?: number | null;
  immunityScore: number;
  immunityLevel: string;
}

export interface UpsertCurrentUserData {
  user_upsert: User_Key;
}

export interface UpsertCurrentUserVariables {
  name?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  provider?: string | null;
}

export interface UpsertMyProfileData {
  patientProfile_upsert: PatientProfile_Key;
}

export interface UpsertMyProfileVariables {
  gender?: string | null;
  age?: number | null;
  weightKg?: number | null;
  heightCm?: number | null;
  purpose?: string | null;
  address?: string | null;
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

export interface WeeklyReport_Key {
  userId: string;
  weekStart: DateString;
  __typename?: 'WeeklyReport_Key';
}

interface UpsertCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: UpsertCurrentUserVariables): MutationRef<UpsertCurrentUserData, UpsertCurrentUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: UpsertCurrentUserVariables): MutationRef<UpsertCurrentUserData, UpsertCurrentUserVariables>;
  operationName: string;
}
export const upsertCurrentUserRef: UpsertCurrentUserRef;

export function upsertCurrentUser(vars?: UpsertCurrentUserVariables): MutationPromise<UpsertCurrentUserData, UpsertCurrentUserVariables>;
export function upsertCurrentUser(dc: DataConnect, vars?: UpsertCurrentUserVariables): MutationPromise<UpsertCurrentUserData, UpsertCurrentUserVariables>;

interface UpsertMyProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: UpsertMyProfileVariables): MutationRef<UpsertMyProfileData, UpsertMyProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: UpsertMyProfileVariables): MutationRef<UpsertMyProfileData, UpsertMyProfileVariables>;
  operationName: string;
}
export const upsertMyProfileRef: UpsertMyProfileRef;

export function upsertMyProfile(vars?: UpsertMyProfileVariables): MutationPromise<UpsertMyProfileData, UpsertMyProfileVariables>;
export function upsertMyProfile(dc: DataConnect, vars?: UpsertMyProfileVariables): MutationPromise<UpsertMyProfileData, UpsertMyProfileVariables>;

interface SubmitDailyImmunityRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SubmitDailyImmunityVariables): MutationRef<SubmitDailyImmunityData, SubmitDailyImmunityVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SubmitDailyImmunityVariables): MutationRef<SubmitDailyImmunityData, SubmitDailyImmunityVariables>;
  operationName: string;
}
export const submitDailyImmunityRef: SubmitDailyImmunityRef;

export function submitDailyImmunity(vars: SubmitDailyImmunityVariables): MutationPromise<SubmitDailyImmunityData, SubmitDailyImmunityVariables>;
export function submitDailyImmunity(dc: DataConnect, vars: SubmitDailyImmunityVariables): MutationPromise<SubmitDailyImmunityData, SubmitDailyImmunityVariables>;

interface CreateWeeklyReportRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateWeeklyReportVariables): MutationRef<CreateWeeklyReportData, CreateWeeklyReportVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateWeeklyReportVariables): MutationRef<CreateWeeklyReportData, CreateWeeklyReportVariables>;
  operationName: string;
}
export const createWeeklyReportRef: CreateWeeklyReportRef;

export function createWeeklyReport(vars: CreateWeeklyReportVariables): MutationPromise<CreateWeeklyReportData, CreateWeeklyReportVariables>;
export function createWeeklyReport(dc: DataConnect, vars: CreateWeeklyReportVariables): MutationPromise<CreateWeeklyReportData, CreateWeeklyReportVariables>;

interface GetCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
  operationName: string;
}
export const getCurrentUserRef: GetCurrentUserRef;

export function getCurrentUser(): QueryPromise<GetCurrentUserData, undefined>;
export function getCurrentUser(dc: DataConnect): QueryPromise<GetCurrentUserData, undefined>;

interface GetMyDailyImmunityHistoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyDailyImmunityHistoryData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyDailyImmunityHistoryData, undefined>;
  operationName: string;
}
export const getMyDailyImmunityHistoryRef: GetMyDailyImmunityHistoryRef;

export function getMyDailyImmunityHistory(): QueryPromise<GetMyDailyImmunityHistoryData, undefined>;
export function getMyDailyImmunityHistory(dc: DataConnect): QueryPromise<GetMyDailyImmunityHistoryData, undefined>;

interface GetMyWeeklyReportsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyWeeklyReportsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyWeeklyReportsData, undefined>;
  operationName: string;
}
export const getMyWeeklyReportsRef: GetMyWeeklyReportsRef;

export function getMyWeeklyReports(): QueryPromise<GetMyWeeklyReportsData, undefined>;
export function getMyWeeklyReports(dc: DataConnect): QueryPromise<GetMyWeeklyReportsData, undefined>;

