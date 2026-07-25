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

/** SSR-safe list fetch — returns [] when API is unreachable or payload is not an array. */
export async function fetchPublicApiList<T>(endpoint: string, revalidate = 60): Promise<T[]> {
  try {
    const data = await fetchPublicApi<T[] | null | undefined>(endpoint, revalidate);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`[public-api] Failed to fetch ${endpoint}`, error);
    return [];
  }
}

/** SSR-safe single-resource fetch — returns null when missing or API unreachable. */
export async function fetchPublicApiSafe<T>(endpoint: string, revalidate = 60): Promise<T | null> {
  try {
    return await fetchPublicApi<T>(endpoint, revalidate);
  } catch (error) {
    console.error(`[public-api] Failed to fetch ${endpoint}`, error);
    return null;
  }
}
