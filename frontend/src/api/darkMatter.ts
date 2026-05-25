import { api } from './client';
import type { DarkMatterReport } from '../types';

const ORG_ID = 'default';

export function fetchDarkMatter() {
  return api.get<DarkMatterReport>(`/dark-matter?org_id=${ORG_ID}`);
}

export function analyzeDarkMatter() {
  return api.post<DarkMatterReport>(`/dark-matter/analyze?org_id=${ORG_ID}`);
}
