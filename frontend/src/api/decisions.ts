import { api } from './client';

export interface DecisionRecord {
  id: string;
  title: string;
  description: string;
  status: string;
  initiator_name: string | null;
  decided_at: string | null;
  completed_at: string | null;
  reverted_at: string | null;
  created_at: string;
}

export function fetchDecisions() {
  return api.get<DecisionRecord[]>('/decisions');
}

export function createDecision(data: { title: string; description?: string; initiator_name?: string }) {
  return api.post<{ id: string; status: string; title: string }>('/decisions', data);
}

export function transitionDecision(decisionId: string, action: string) {
  return api.post<{ id: string; status: string }>(`/decisions/${decisionId}/${action}`);
}

export function autoDiscoverDecisions() {
  return api.post<{ discovered: number }>('/decisions/auto-discover');
}
