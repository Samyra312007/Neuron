import { api } from './client';

export interface ActivityEvent {
  id: string;
  event_type: string;
  source: string;
  description: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  severity: string;
  created_at: string;
}

export function fetchActivity(limit = 20) {
  return api.get<ActivityEvent[]>(`/activity?limit=${limit}`);
}
