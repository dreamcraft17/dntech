import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function truncate(text: string, length: number) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '');
}
