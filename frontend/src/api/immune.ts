import { api } from './client';
import type { ImmuneInfection } from '../types';

const ORG_ID = 'default';

export function fetchInfections() {
  return api.get<ImmuneInfection[]>(`/immune/infections?org_id=${ORG_ID}`);
}

export function analyzeInfections() {
  return api.post<ImmuneInfection[]>(`/immune/analyze?org_id=${ORG_ID}`);
}

export function treatInfection(infectionId: string) {
  return api.post<{ success: boolean; message: string }>('/immune/treat', {
    infection_id: infectionId,
  });
}
