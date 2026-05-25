import { api } from './client';
import type { GenomeSequence } from '../types';

export function fetchGenome() {
  return api.get<GenomeSequence>('/genome');
}

export function fetchGenomeHistory() {
  return api.get<GenomeSequence[]>('/genome/history');
}

export function analyzeGenome() {
  return api.post<GenomeSequence>('/genome/analyze');
}
