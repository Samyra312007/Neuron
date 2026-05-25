import { api } from './client';
import type { MetabolicMetric } from '../types';

export function fetchMetabolic() {
  return api.get<MetabolicMetric>('/metabolic');
}

export function analyzeMetabolic() {
  return api.post<MetabolicMetric>('/metabolic/analyze');
}
