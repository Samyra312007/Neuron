import { api } from './client';

export interface BenchmarkItem {
  metric: string;
  current: number;
  industry_avg: number;
  top_quartile: number;
  gap_vs_avg: number;
}

export interface BenchmarkResponse {
  benchmarks: BenchmarkItem[];
  industry_label: string;
}

export function fetchBenchmarks() {
  return api.get<BenchmarkResponse>('/benchmarks');
}
