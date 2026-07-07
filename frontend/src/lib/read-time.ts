/** Estimasi waktu baca artikel (200 kata/menit). */
export function estimateReadTime(text?: string | null): number {
  if (!text?.trim()) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatReadTime(minutes: number): string {
  return `${minutes} menit baca`;
}
