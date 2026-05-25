import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGenome, fetchGenomeHistory, analyzeGenome } from '../api/genome';

export function useGenome() {
  return useQuery({
    queryKey: ['genome'],
    queryFn: fetchGenome,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useGenomeHistory() {
  return useQuery({
    queryKey: ['genome', 'history'],
    queryFn: fetchGenomeHistory,
    retry: 1,
    staleTime: 60_000,
  });
}

export function useAnalyzeGenome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: analyzeGenome,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['genome'] });
    },
  });
}
