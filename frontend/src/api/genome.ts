import { api } from './client';
import type { GenomeSequence } from '../types';

const ORG_ID = 'default';

export function fetchGenome() {
  return api.get<GenomeSequence>(`/genome?org_id=${ORG_ID}`);
}

export function fetchGenomeHistory() {
  return api.get<GenomeSequence[]>(`/genome/history?org_id=${ORG_ID}`);
}

export function analyzeGenome() {
  return api.post<GenomeSequence>(`/genome/analyze?org_id=${ORG_ID}`);
}
