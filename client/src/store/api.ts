const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...(options.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || err.error || 'Request failed');
  }
  return res.json();
}

export async function uploadFile(path: string, file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || err.error || 'Upload failed');
  }
  return res.json();
}
