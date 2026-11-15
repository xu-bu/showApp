import { EXPO_PUBLIC_API_GATEWAY_URL } from '../consts';

const baseUrl = (EXPO_PUBLIC_API_GATEWAY_URL ?? '').replace(/\/$/, '');

async function request(path: string, init?: RequestInit) {
  if (!baseUrl) {
    throw new Error('API gateway is not configured');
  }
  const res = await fetch(`${baseUrl}${path}`, init);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return JSON.parse(text);
}

export async function getKeyWords(): Promise<string[]> {
  const body = await request('/api/keywords');
  const keywords = body?.data?.keywords ?? body?.keywords ?? [];
  return Array.isArray(keywords) ? keywords.filter((item) => typeof item === 'string') : [];
}

export async function updateKeyWords(keywords: string[]) {
  await request('/api/keywords', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords }),
  });
}