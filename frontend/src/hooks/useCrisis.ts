import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchCrisisMatches, seedCrisisPatterns } from '../api/crisis';

export function useCrisisMatches() {
  return useQuery({
    queryKey: ['crisis', 'matches'],
    queryFn: fetchCrisisMatches,
    retry: 1,
    staleTime: 15_000,
  });
}

export function useSeedCrisisPatterns() {
  return useMutation({
    mutationFn: seedCrisisPatterns,
  });
}
