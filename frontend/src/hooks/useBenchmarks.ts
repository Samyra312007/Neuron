import { useQuery } from '@tanstack/react-query';
import { fetchBenchmarks } from '../api/benchmarks';

export function useBenchmarks() {
  return useQuery({
    queryKey: ['benchmarks'],
    queryFn: fetchBenchmarks,
    retry: 1,
    staleTime: 30_000,
  });
}
