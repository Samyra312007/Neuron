import { api } from './client';

export interface AlertConfig {
  id: string;
  metric_name: string;
  comparison_operator: string;
  threshold_value: number;
  label: string;
  enabled: boolean;
}

export interface AlertHistoryItem {
  id: string;
  alert_config_id: string;
  metric_value: number;
  threshold_value: number;
  triggered_at: string;
  resolved_at: string | null;
}

export function fetchAlertConfigs() {
  return api.get<AlertConfig[]>('/alerts/configs');
}

export function createAlertConfig(data: { metric_name: string; comparison_operator: string; threshold_value: number; label: string }) {
  return api.post<{ id: string }>('/alerts/configs', data);
}

export function deleteAlertConfig(id: string) {
  return api.delete<{ ok: boolean }>(`/alerts/configs/${id}`);
}

export function fetchAlertHistory() {
  return api.get<AlertHistoryItem[]>('/alerts/history');
}

export function evaluateAlerts() {
  return api.post<{ triggered: any[] }>('/alerts/evaluate');
}
