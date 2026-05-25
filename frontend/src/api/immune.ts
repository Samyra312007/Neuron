import { api } from './client';
import type { ImmuneInfection } from '../types';

export function fetchInfections() {
  return api.get<ImmuneInfection[]>('/immune/infections');
}

export function analyzeInfections() {
  return api.post<ImmuneInfection[]>('/immune/analyze');
}

export function treatInfection(infectionId: string) {
  return api.post<{ success: boolean; message: string }>('/immune/treat', {
    infection_id: infectionId,
  });
}
