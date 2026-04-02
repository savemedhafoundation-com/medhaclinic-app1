import { useMemo } from 'react';

import { useGamesQuery } from './useGames';
import { useHealthQuery } from './useHealth';
import { useTransactionsQuery } from './useTransactions';
import { useUsersQuery } from './useUsers';
import { useWithdrawalsQuery } from './useWithdrawals';

export function useDashboardData() {
  const usersQuery = useUsersQuery();
  const transactionsQuery = useTransactionsQuery();
  const withdrawalsQuery = useWithdrawalsQuery({ status: 'pending' });
  const allWithdrawalsQuery = useWithdrawalsQuery();
  const gamesQuery = useGamesQuery({ status: 'active' });
  const healthQuery = useHealthQuery();

  const metrics = useMemo(() => {
    const users = usersQuery.data?.items ?? [];
    const transactions = transactionsQuery.data?.items ?? [];
    const activeGames = gamesQuery.data?.items ?? [];
    const pendingWithdrawals = withdrawalsQuery.data?.items ?? [];

    const totalRevenue =
      transactionsQuery.data?.summary?.totalRevenue ??
      transactions
        .filter(item => item.status === 'success')
        .reduce((sum, item) => sum + Math.max(0, item.amount), 0);

    const dailyRevenue = transactions
      .filter(item => item.status === 'success')
      .slice(0, 14)
      .reverse()
      .map(item => ({
        date: new Date(item.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        }),
        value: item.amount,
      }));

    const withdrawalTrend = Object.values(
      (allWithdrawalsQuery.data?.items ?? []).reduce<Record<string, { status: string; total: number }>>(
        (accumulator, item) => {
          const key = item.status;
          accumulator[key] = {
            status: key,
            total: (accumulator[key]?.total ?? 0) + 1,
          };
          return accumulator;
        },
        {}
      )
    );

    return {
      totalUsers: usersQuery.data?.total ?? users.length,
      totalRevenue,
      activeGames: gamesQuery.data?.total ?? activeGames.length,
      pendingWithdrawals: withdrawalsQuery.data?.total ?? pendingWithdrawals.length,
      dailyRevenue,
      withdrawalTrend,
    };
  }, [allWithdrawalsQuery.data, gamesQuery.data, transactionsQuery.data, usersQuery.data, withdrawalsQuery.data]);

  return {
    usersQuery,
    transactionsQuery,
    withdrawalsQuery,
    allWithdrawalsQuery,
    gamesQuery,
    healthQuery,
    metrics,
    isLoading:
      usersQuery.isLoading ||
      transactionsQuery.isLoading ||
      withdrawalsQuery.isLoading ||
      gamesQuery.isLoading ||
      healthQuery.isLoading,
  };
}
