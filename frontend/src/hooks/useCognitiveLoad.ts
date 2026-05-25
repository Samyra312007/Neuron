import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCognitiveLoad, analyzeCognitiveLoad } from '../api/cognitiveLoad';

export function useCognitiveLoad() {
  return useQuery({
    queryKey: ['cognitiveLoad'],
    queryFn: fetchCognitiveLoad,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useAnalyzeCognitiveLoad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: analyzeCognitiveLoad,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cognitiveLoad'] });
    },
  });
}
