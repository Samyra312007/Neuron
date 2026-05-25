import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { takeSnapshot, listSnapshots, getSnapshot, compareSnapshots } from '../api/fossil';

export function useSnapshots() {
  return useQuery({
    queryKey: ['fossil', 'snapshots'],
    queryFn: listSnapshots,
    retry: 1,
    staleTime: 10_000,
  });
}

export function useSnapshot(id: string | null) {
  return useQuery({
    queryKey: ['fossil', 'snapshot', id],
    queryFn: () => getSnapshot(id!),
    enabled: !!id,
    retry: 1,
  });
}

export function useCompare(beforeId: string | null, afterId: string | null) {
  return useQuery({
    queryKey: ['fossil', 'compare', beforeId, afterId],
    queryFn: () => compareSnapshots(beforeId!, afterId!),
    enabled: !!beforeId && !!afterId,
    retry: 1,
  });
}

export function useTakeSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: takeSnapshot,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fossil', 'snapshots'] });
    },
  });
}
