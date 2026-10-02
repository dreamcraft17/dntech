/** Nomor WhatsApp resmi DN Tech (tampilan). */
export const DNTECH_WHATSAPP_DISPLAY = '+62 81232037001';

/** Digit-only E.164 without + (contoh: 6281232037001) untuk wa.me */
export function normalizePhoneForWhatsApp(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = `62${digits.slice(1)}`;
  } else if (!digits.startsWith('62')) {
    digits = `62${digits}`;
  }
  return digits;
}

export function whatsAppUrl(phone: string, prefilledMessage?: string): string {
  const base = `https://wa.me/${normalizePhoneForWhatsApp(phone)}`;
  if (!prefilledMessage) return base;
  return `${base}?text=${encodeURIComponent(prefilledMessage)}`;
}

export function resolveCompanyPhone(phone?: string | null): string {
  const trimmed = phone?.trim();
  return trimmed || DNTECH_WHATSAPP_DISPLAY;
}
