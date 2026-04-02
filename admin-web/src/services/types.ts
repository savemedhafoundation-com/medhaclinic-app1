export type AdminClaimRole = 'admin' | 'moderator' | 'viewer';

export type ApiEnvelope<T> =
  | T
  | {
      data?: T;
      item?: T;
      success?: boolean;
      message?: string;
    };

export type PaginatedEnvelope<T> =
  | T[]
  | {
      data?: T[];
      items?: T[];
      results?: T[];
      users?: T[];
      transactions?: T[];
      withdrawals?: T[];
      games?: T[];
      total?: number;
      page?: number;
      pageSize?: number;
      summary?: Record<string, number>;
    };

export type DashboardMetric = {
  label: string;
  value: string;
  helperText?: string;
  delta?: string;
};

export type AdminUser = {
  id: string;
  firebaseUid: string;
  email: string | null;
  name: string | null;
  role: AdminClaimRole | string;
  walletBalance: number;
  isBanned: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
  lastSeenAt?: string | null;
  phoneNumber?: string | null;
  status?: 'active' | 'inactive' | 'banned';
};

export type AdminUserDetails = AdminUser & {
  notes?: string | null;
  totalTransactions?: number;
  totalWithdrawals?: number;
  gamesPlayed?: number;
};

export type WalletAdjustmentPayload = {
  amount: number;
  operation: 'credit' | 'debit';
  reason: string;
};

export type TransactionType =
  | 'credit'
  | 'debit'
  | 'deposit'
  | 'withdrawal'
  | 'manual_adjustment'
  | 'game_entry'
  | 'game_win'
  | 'platform_fee';

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'reversed';

export type TransactionRecord = {
  id: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  amount: number;
  currency: string;
  type: TransactionType | string;
  status: TransactionStatus | string;
  reference?: string | null;
  description?: string | null;
  createdAt: string;
};

export type ManualAdjustmentPayload = {
  userId: string;
  amount: number;
  operation: 'credit' | 'debit';
  reason: string;
};

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'processing';

export type WithdrawalRecord = {
  id: string;
  userId: string;
  userName?: string | null;
  amount: number;
  currency: string;
  status: WithdrawalStatus | string;
  requestedAt: string;
  processedAt?: string | null;
  payoutMethod?: string | null;
  riskFlag?: boolean;
  note?: string | null;
};

export type WithdrawalDecisionPayload = {
  note?: string;
};

export type GameRoom = {
  id: string;
  roomCode: string;
  stakeAmount: number;
  playersCount: number;
  status: 'waiting' | 'active' | 'completed' | 'cancelled' | string;
  createdAt: string;
  startedAt?: string | null;
  suspiciousScore?: number | null;
  flaggedReason?: string | null;
  hostUserName?: string | null;
};

export type HealthResponse = {
  success: boolean;
  service: string;
  status: string;
  timestamp: string;
  firebaseAdminConfigured?: boolean;
  firebaseAdminCredentialSource?: string | null;
  firebaseAdminProjectId?: string | null;
  googleCloudRuntime?: boolean;
  googleCloudProjectId?: string | null;
  openaiConfigured?: boolean;
  databaseHost?: string | null;
  databaseConnectionMode?: string | null;
  databaseSocketPath?: string | null;
  instanceConnectionName?: string | null;
  databaseReachable?: boolean;
  databaseMessage?: string | null;
};

export type ListQuery = {
  search?: string;
  status?: string;
  userId?: string;
  from?: string;
  to?: string;
};
