import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createManualAdjustment, getTransactions } from '../services/adminApi';
import type { ListQuery, ManualAdjustmentPayload } from '../services/types';

export function useTransactionsQuery(query?: ListQuery) {
  return useQuery({
    queryKey: ['transactions', query],
    queryFn: () => getTransactions(query),
  });
}

export function useManualAdjustmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ManualAdjustmentPayload) => createManualAdjustment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
