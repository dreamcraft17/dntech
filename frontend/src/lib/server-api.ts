import 'server-only';

import { getApiBaseUrl } from './api';

function apiCandidates(): string[] {
  const candidates = [
    process.env.API_INTERNAL_URL,
    process.env.NODE_ENV === 'production' ? 'http://127.0.0.1:4000/api/v1' : undefined,
    getApiBaseUrl(),
  ].filter((value): value is string => Boolean(value));

  return [...new Set(candidates.map((value) => value.replace(/\/$/, '')))];
}

export async function fetchPublicApi<T>(endpoint: string, revalidate = 60): Promise<T> {
  const errors: string[] = [];

  for (const apiUrl of apiCandidates()) {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, { next: { revalidate } });
      if (!response.ok) {
        errors.push(`${apiUrl}: HTTP ${response.status}`);
        continue;
      }

      const payload = await response.json();
      return payload.data as T;
    } catch (error) {
      errors.push(`${apiUrl}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`All API endpoints failed (${errors.join('; ')})`);
}
