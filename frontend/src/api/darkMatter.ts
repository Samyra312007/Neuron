import { api, getDownloadUrl } from './client';
import type { DarkMatterReport } from '../types';

export function fetchDarkMatter() {
  return api.get<DarkMatterReport>('/dark-matter');
}

export function analyzeDarkMatter() {
  return api.post<DarkMatterReport>('/dark-matter/analyze');
}

export function getDarkMatterCsvUrl() {
  return getDownloadUrl('/dark-matter/export/csv');
}

export function getDarkMatterPdfUrl() {
  return getDownloadUrl('/dark-matter/export/pdf');
}
