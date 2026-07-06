const BASE = import.meta.env.VITE_API_URL ?? '/api';
const TOKEN_KEY = 'aio_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const e = await res.json();
      msg = e?.error?.message || e?.message || msg;
    } catch {
      /* response had no JSON body */
    }
    throw new Error(msg);
  }

  const json = await res.json().catch(() => ({}));
  // backend responses are wrapped in { data }; unwrap when present
  return (json && typeof json === 'object' && 'data' in json ? (json as any).data : json) as T;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'trainer' | 'participant';
  tenantId: string;
}
export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const authApi = {
  login: (body: { email?: string; username?: string; password: string }) =>
    api<LoginResult>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body: { name: string; email: string; password: string; username?: string }) =>
    api<LoginResult>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  forgotPassword: (email: string) =>
    api<{ ok: boolean }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) =>
    api<{ ok: boolean }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
};
