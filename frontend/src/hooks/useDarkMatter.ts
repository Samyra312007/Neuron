import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDarkMatter, analyzeDarkMatter } from '../api/darkMatter';

export function useDarkMatter() {
  return useQuery({
    queryKey: ['darkMatter'],
    queryFn: fetchDarkMatter,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useAnalyzeDarkMatter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: analyzeDarkMatter,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['darkMatter'] });
    },
  });
}
