import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchInfections, analyzeInfections, treatInfection } from '../api/immune';

export function useInfections() {
  return useQuery({
    queryKey: ['infections'],
    queryFn: fetchInfections,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useAnalyzeInfections() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: analyzeInfections,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['infections'] });
    },
  });
}

export function useTreatInfection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: treatInfection,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['infections'] });
    },
  });
}
