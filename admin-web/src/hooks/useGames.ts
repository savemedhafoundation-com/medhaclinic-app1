import { useQuery } from '@tanstack/react-query';

import { getGames } from '../services/adminApi';
import type { ListQuery } from '../services/types';

export function useGamesQuery(query?: ListQuery) {
  return useQuery({
    queryKey: ['games', query],
    queryFn: () => getGames(query),
  });
}
