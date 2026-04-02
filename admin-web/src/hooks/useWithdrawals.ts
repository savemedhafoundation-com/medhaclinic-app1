import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { approveWithdrawal, getWithdrawals, rejectWithdrawal } from '../services/adminApi';
import type { ListQuery, WithdrawalDecisionPayload } from '../services/types';

export function useWithdrawalsQuery(query?: ListQuery) {
  return useQuery({
    queryKey: ['withdrawals', query],
    queryFn: () => getWithdrawals(query),
  });
}

export function useApproveWithdrawalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ withdrawalId, payload }: { withdrawalId: string; payload: WithdrawalDecisionPayload }) =>
      approveWithdrawal(withdrawalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useRejectWithdrawalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ withdrawalId, payload }: { withdrawalId: string; payload: WithdrawalDecisionPayload }) =>
      rejectWithdrawal(withdrawalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
    },
  });
}
