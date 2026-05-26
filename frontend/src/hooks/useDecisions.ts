import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDecisions, createDecision, transitionDecision, autoDiscoverDecisions } from '../api/decisions';

export function useDecisions() {
  return useQuery({
    queryKey: ['decisions'],
    queryFn: fetchDecisions,
    retry: 1,
    staleTime: 15_000,
  });
}

export function useCreateDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDecision,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['decisions'] }),
  });
}

export function useTransitionDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => transitionDecision(id, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['decisions'] }),
  });
}

export function useAutoDiscoverDecisions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: autoDiscoverDecisions,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['decisions'] }),
  });
}
