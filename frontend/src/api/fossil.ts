import { api } from './client';

export interface SnapshotSummary {
  id: string;
  snapshot_date: string;
  created_at: string;
}

export interface SnapshotDetail {
  id: string;
  snapshot_date: string;
  state: Record<string, any>;
}

export interface CompareResult {
  before: { snapshot_date: string; state: Record<string, any> };
  after: { snapshot_date: string; state: Record<string, any> };
  delta: Record<string, Record<string, number | null>>;
}

export function takeSnapshot() {
  return api.post<SnapshotDetail>('/fossil/snapshot');
}

export function listSnapshots() {
  return api.get<SnapshotSummary[]>('/fossil/snapshots');
}

export function getSnapshot(id: string) {
  return api.get<SnapshotDetail>(`/fossil/snapshot/${id}`);
}

export function compareSnapshots(beforeId: string, afterId: string) {
  return api.get<CompareResult>(`/fossil/compare?before_id=${beforeId}&after_id=${afterId}`);
}
