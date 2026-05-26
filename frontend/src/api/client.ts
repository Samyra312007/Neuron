const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

let _orgId: string | null = null;

async function getOrgId(): Promise<string> {
  if (_orgId) return _orgId;
  const res = await fetch(`${API_BASE}/api/v1/orgs/first`);
  if (!res.ok) throw new ApiError(res.status, 'Failed to fetch organization');
  const org = await res.json();
  _orgId = org.id as string;
  return _orgId;
}

export function resetOrgId() {
  _orgId = null;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const orgId = await getOrgId();
  const separator = path.includes('?') ? '&' : '?';
  const url = `${API_BASE}/api/v1${path}${separator}org_id=${orgId}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.statusText}`);
  }
  return res.json();
}

export async function getDownloadUrl(path: string): Promise<string> {
  const orgId = await getOrgId();
  const separator = path.includes('?') ? '&' : '?';
  return `${API_BASE}/api/v1${path}${separator}org_id=${orgId}`;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) =>
    request<T>(path, {
      method: 'DELETE',
    }),
};
