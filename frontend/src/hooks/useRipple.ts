import { useMutation } from '@tanstack/react-query';
import { simulateRipple, type SimulateRequest, type RippleResult } from '../api/ripple';

export function useSimulateRipple() {
  return useMutation({
    mutationFn: (body: SimulateRequest) => simulateRipple(body),
  });
}
