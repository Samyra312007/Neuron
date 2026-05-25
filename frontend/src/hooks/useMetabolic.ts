import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMetabolic, analyzeMetabolic } from '../api/metabolic';

export function useMetabolic() {
  return useQuery({
    queryKey: ['metabolic'],
    queryFn: fetchMetabolic,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useAnalyzeMetabolic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: analyzeMetabolic,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['metabolic'] });
    },
  });
}
