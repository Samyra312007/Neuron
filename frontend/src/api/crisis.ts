import { api } from './client';

export interface CrisisMatch {
  pattern_name: string;
  pattern_description: string;
  severity: string;
  match_score: number;
  details: Record<string, string>;
}

export function seedCrisisPatterns() {
  return api.post<{message: string}>('/crisis/seed-patterns');
}

export function fetchCrisisMatches() {
  return api.get<{matches: CrisisMatch[]; snapshot_date: string; message?: string}>('/crisis/matches');
}
