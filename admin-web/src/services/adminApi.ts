import { apiClient } from './apiClient';
import type {
  AdminUser,
  AdminUserDetails,
  ApiEnvelope,
  GameRoom,
  HealthResponse,
  ListQuery,
  ManualAdjustmentPayload,
  PaginatedEnvelope,
  TransactionRecord,
  WalletAdjustmentPayload,
  WithdrawalDecisionPayload,
  WithdrawalRecord,
} from './types';

type ListResult<T> = {
  items: T[];
  total: number;
  summary?: Record<string, number>;
};

function unwrapItem<T>(payload: ApiEnvelope<T>): T {
  if (typeof payload === 'object' && payload !== null && ('data' in payload || 'item' in payload)) {
    return (payload.data ?? payload.item) as T;
  }

  return payload as T;
}

function unwrapList<T>(payload: PaginatedEnvelope<T>): ListResult<T> {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      total: payload.length,
    };
  }

  const items =
    payload.items ??
    payload.data ??
    payload.results ??
    payload.users ??
    payload.transactions ??
    payload.withdrawals ??
    payload.games ??
    [];

  return {
    items,
    total: payload.total ?? items.length,
    summary: payload.summary,
  };
}

function toSearchParams(query?: ListQuery) {
  const params = new URLSearchParams();

  if (!query) {
    return params;
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return params;
}

export async function getUsers(query?: ListQuery) {
  const { data } = await apiClient.get<PaginatedEnvelope<AdminUser>>(`/users?${toSearchParams(query)}`);
  return unwrapList(data);
}

export async function getUserById(userId: string) {
  const { data } = await apiClient.get<ApiEnvelope<AdminUserDetails>>(`/users/${userId}`);
  return unwrapItem(data);
}

export async function updateUserWallet(userId: string, payload: WalletAdjustmentPayload) {
  const { data } = await apiClient.patch<ApiEnvelope<AdminUserDetails>>(`/users/${userId}/wallet`, payload);
  return unwrapItem(data);
}

export async function setUserBanState(userId: string, banned: boolean) {
  const path = banned ? `/users/${userId}/ban` : `/users/${userId}/unban`;
  const { data } = await apiClient.post<ApiEnvelope<AdminUserDetails>>(path);
  return unwrapItem(data);
}

export async function getTransactions(query?: ListQuery) {
  const { data } = await apiClient.get<PaginatedEnvelope<TransactionRecord>>(
    `/transactions?${toSearchParams(query)}`
  );
  return unwrapList(data);
}

export async function createManualAdjustment(payload: ManualAdjustmentPayload) {
  const { data } = await apiClient.post<ApiEnvelope<TransactionRecord>>(
    '/transactions/manual-adjustment',
    payload
  );
  return unwrapItem(data);
}

export async function getWithdrawals(query?: ListQuery) {
  const { data } = await apiClient.get<PaginatedEnvelope<WithdrawalRecord>>(
    `/withdrawals?${toSearchParams(query)}`
  );
  return unwrapList(data);
}

export async function approveWithdrawal(withdrawalId: string, payload: WithdrawalDecisionPayload) {
  const { data } = await apiClient.post<ApiEnvelope<WithdrawalRecord>>(
    `/withdrawals/${withdrawalId}/approve`,
    payload
  );
  return unwrapItem(data);
}

export async function rejectWithdrawal(withdrawalId: string, payload: WithdrawalDecisionPayload) {
  const { data } = await apiClient.post<ApiEnvelope<WithdrawalRecord>>(
    `/withdrawals/${withdrawalId}/reject`,
    payload
  );
  return unwrapItem(data);
}

export async function getGames(query?: ListQuery) {
  const { data } = await apiClient.get<PaginatedEnvelope<GameRoom>>(`/games?${toSearchParams(query)}`);
  return unwrapList(data);
}

export async function getHealth() {
  const { data } = await apiClient.get<HealthResponse>('/health');
  return data;
}
