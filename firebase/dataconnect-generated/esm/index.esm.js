import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'mobile',
  service: 'medhaclinic-3ba87-service',
  location: 'asia-south1'
};

export const upsertCurrentUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertCurrentUser', inputVars);
}
upsertCurrentUserRef.operationName = 'UpsertCurrentUser';

export function upsertCurrentUser(dcOrVars, vars) {
  return executeMutation(upsertCurrentUserRef(dcOrVars, vars));
}

export const upsertMyProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertMyProfile', inputVars);
}
upsertMyProfileRef.operationName = 'UpsertMyProfile';

export function upsertMyProfile(dcOrVars, vars) {
  return executeMutation(upsertMyProfileRef(dcOrVars, vars));
}

export const submitDailyImmunityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SubmitDailyImmunity', inputVars);
}
submitDailyImmunityRef.operationName = 'SubmitDailyImmunity';

export function submitDailyImmunity(dcOrVars, vars) {
  return executeMutation(submitDailyImmunityRef(dcOrVars, vars));
}

export const createWeeklyReportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateWeeklyReport', inputVars);
}
createWeeklyReportRef.operationName = 'CreateWeeklyReport';

export function createWeeklyReport(dcOrVars, vars) {
  return executeMutation(createWeeklyReportRef(dcOrVars, vars));
}

export const getCurrentUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCurrentUser');
}
getCurrentUserRef.operationName = 'GetCurrentUser';

export function getCurrentUser(dc) {
  return executeQuery(getCurrentUserRef(dc));
}

export const getMyDailyImmunityHistoryRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyDailyImmunityHistory');
}
getMyDailyImmunityHistoryRef.operationName = 'GetMyDailyImmunityHistory';

export function getMyDailyImmunityHistory(dc) {
  return executeQuery(getMyDailyImmunityHistoryRef(dc));
}

export const getMyWeeklyReportsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyWeeklyReports');
}
getMyWeeklyReportsRef.operationName = 'GetMyWeeklyReports';

export function getMyWeeklyReports(dc) {
  return executeQuery(getMyWeeklyReportsRef(dc));
}

