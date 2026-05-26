import { useQuery } from '@tanstack/react-query';
import { fetchActivity } from '../api/activity';

export function useActivity(limit = 20) {
  return useQuery({
    queryKey: ['activity', limit],
    queryFn: () => fetchActivity(limit),
    retry: 1,
    staleTime: 15_000,
  });
}
