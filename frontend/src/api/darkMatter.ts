import { api } from './client';
import type { DarkMatterReport } from '../types';

export function fetchDarkMatter() {
  return api.get<DarkMatterReport>('/dark-matter');
}

export function analyzeDarkMatter() {
  return api.post<DarkMatterReport>('/dark-matter/analyze');
}
