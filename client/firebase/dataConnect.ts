import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';

import { connectorConfig } from './dataconnect-generated';
import { firebaseApp, firebaseDataConnectEmulatorHost } from './firebaseConfig';

export const medhaDataConnect = getDataConnect(firebaseApp, connectorConfig);
const emulatorHost = firebaseDataConnectEmulatorHost;

if (emulatorHost) {
  const [host, portValue] = emulatorHost.split(':');
  const port = portValue ? Number(portValue) : undefined;

  if (host) {
    connectDataConnectEmulator(medhaDataConnect, host, port, false);
  }
}

export {
  createWeeklyReport,
  getCurrentUser,
  getMyDailyImmunityHistory,
  getMyWeeklyReports,
  submitDailyImmunity,
  upsertCurrentUser,
  upsertMyProfile,
  type CreateWeeklyReportVariables,
  type GetCurrentUserData,
  type GetMyDailyImmunityHistoryData,
  type GetMyWeeklyReportsData,
  type SubmitDailyImmunityVariables,
  type UpsertCurrentUserVariables,
  type UpsertMyProfileVariables,
} from './dataconnect-generated';
