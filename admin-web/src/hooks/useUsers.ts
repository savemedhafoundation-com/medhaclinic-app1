import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getUserById, getUsers, setUserBanState, updateUserWallet } from '../services/adminApi';
import type { ListQuery, WalletAdjustmentPayload } from '../services/types';

export function useUsersQuery(query?: ListQuery) {
  return useQuery({
    queryKey: ['users', query],
    queryFn: () => getUsers(query),
  });
}

export function useUserDetailsQuery(userId?: string) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUserById(userId!),
    enabled: Boolean(userId),
  });
}

export function useWalletAdjustmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: WalletAdjustmentPayload }) =>
      updateUserWallet(userId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
    },
  });
}

export function useBanUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, banned }: { userId: string; banned: boolean }) =>
      setUserBanState(userId, banned),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
    },
  });
}
