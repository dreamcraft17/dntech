import {
  DNTECH_WHATSAPP_DISPLAY,
  normalizePhoneForWhatsApp,
  resolveCompanyPhone,
  whatsAppUrl,
} from '@/lib/contact-links';

describe('contact-links', () => {
  it('builds wa.me URL from display number', () => {
    expect(whatsAppUrl(DNTECH_WHATSAPP_DISPLAY)).toBe('https://wa.me/6281232037001');
  });

  it('normalizes leading zero', () => {
    expect(normalizePhoneForWhatsApp('081232037001')).toBe('6281232037001');
  });

  it('falls back to default WhatsApp when settings empty', () => {
    expect(resolveCompanyPhone(undefined)).toBe('+62 81232037001');
    expect(resolveCompanyPhone('  ')).toBe('+62 81232037001');
  });
});
