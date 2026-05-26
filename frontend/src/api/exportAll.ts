import { getDownloadUrl } from './client';

export function getExportAllPdfUrl() {
  return getDownloadUrl('/export-all/pdf');
}
