const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'mobile',
  service: 'medhaclinic-3ba87-service',
  location: 'asia-south1'
};
exports.connectorConfig = connectorConfig;

const upsertCurrentUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertCurrentUser', inputVars);
}
upsertCurrentUserRef.operationName = 'UpsertCurrentUser';
exports.upsertCurrentUserRef = upsertCurrentUserRef;

exports.upsertCurrentUser = function upsertCurrentUser(dcOrVars, vars) {
  return executeMutation(upsertCurrentUserRef(dcOrVars, vars));
};

const upsertMyProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertMyProfile', inputVars);
}
upsertMyProfileRef.operationName = 'UpsertMyProfile';
exports.upsertMyProfileRef = upsertMyProfileRef;

exports.upsertMyProfile = function upsertMyProfile(dcOrVars, vars) {
  return executeMutation(upsertMyProfileRef(dcOrVars, vars));
};

const submitDailyImmunityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SubmitDailyImmunity', inputVars);
}
submitDailyImmunityRef.operationName = 'SubmitDailyImmunity';
exports.submitDailyImmunityRef = submitDailyImmunityRef;

exports.submitDailyImmunity = function submitDailyImmunity(dcOrVars, vars) {
  return executeMutation(submitDailyImmunityRef(dcOrVars, vars));
};

const createWeeklyReportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateWeeklyReport', inputVars);
}
createWeeklyReportRef.operationName = 'CreateWeeklyReport';
exports.createWeeklyReportRef = createWeeklyReportRef;

exports.createWeeklyReport = function createWeeklyReport(dcOrVars, vars) {
  return executeMutation(createWeeklyReportRef(dcOrVars, vars));
};

const getCurrentUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCurrentUser');
}
getCurrentUserRef.operationName = 'GetCurrentUser';
exports.getCurrentUserRef = getCurrentUserRef;

exports.getCurrentUser = function getCurrentUser(dc) {
  return executeQuery(getCurrentUserRef(dc));
};

const getMyDailyImmunityHistoryRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyDailyImmunityHistory');
}
getMyDailyImmunityHistoryRef.operationName = 'GetMyDailyImmunityHistory';
exports.getMyDailyImmunityHistoryRef = getMyDailyImmunityHistoryRef;

exports.getMyDailyImmunityHistory = function getMyDailyImmunityHistory(dc) {
  return executeQuery(getMyDailyImmunityHistoryRef(dc));
};

const getMyWeeklyReportsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyWeeklyReports');
}
getMyWeeklyReportsRef.operationName = 'GetMyWeeklyReports';
exports.getMyWeeklyReportsRef = getMyWeeklyReportsRef;

exports.getMyWeeklyReports = function getMyWeeklyReports(dc) {
  return executeQuery(getMyWeeklyReportsRef(dc));
};
