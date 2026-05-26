import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAlertConfigs, createAlertConfig, deleteAlertConfig, fetchAlertHistory, evaluateAlerts } from '../api/alerts';

export function useAlertConfigs() {
  return useQuery({
    queryKey: ['alerts', 'configs'],
    queryFn: fetchAlertConfigs,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useAlertHistory() {
  return useQuery({
    queryKey: ['alerts', 'history'],
    queryFn: fetchAlertHistory,
    retry: 1,
    staleTime: 15_000,
  });
}

export function useCreateAlertConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAlertConfig,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts', 'configs'] }),
  });
}

export function useDeleteAlertConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAlertConfig(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts', 'configs'] }),
  });
}

export function useEvaluateAlerts() {
  return useMutation({
    mutationFn: evaluateAlerts,
  });
}
