import { api } from './client';
import type { CognitiveLoadMetric } from '../types';

export function fetchCognitiveLoad() {
  return api.get<CognitiveLoadMetric>('/cognitive-load');
}

export function analyzeCognitiveLoad() {
  return api.post<CognitiveLoadMetric>('/cognitive-load/analyze');
}
