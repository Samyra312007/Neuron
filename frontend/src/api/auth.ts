import { api, getDownloadUrl } from './client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  org_id: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const url = await getDownloadUrl('/auth/login');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function register(email: string, password: string, name: string, org_name?: string): Promise<AuthResponse> {
  const url = await getDownloadUrl('/auth/register');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, org_name }),
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${(await getDownloadUrl('/auth/me')).split('?')[0]}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Session expired');
  return res.json();
}
