/** Estimasi waktu baca artikel (200 kata/menit). Pure — wording lives in messages. */
export function estimateReadTime(text?: string | null): number {
  if (!text?.trim()) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
