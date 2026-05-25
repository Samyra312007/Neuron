import { api } from './client';

export interface SimulateRequest {
  change_description: string;
  target_team?: string;
  intensity?: string;
}

export interface RippleResult {
  [metric: string]: {
    direction: 'positive' | 'negative' | 'neutral';
    magnitude: number;
    description: string;
    affected_teams: string[];
  };
}

export function simulateRipple(body: SimulateRequest) {
  return api.post<RippleResult>('/ripple/simulate', body);
}
