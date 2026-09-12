import { PRIVACY_POLICY_HTML, TERMS_OF_SERVICE_HTML } from '@/lib/legal-content';

describe('legal page fallbacks', () => {
  it('privacy policy cites UU PDP and data-controller identity', () => {
    expect(PRIVACY_POLICY_HTML).toContain('Undang-Undang Nomor 27 Tahun 2022');
    expect(PRIVACY_POLICY_HTML).toContain('PT. Dozer Napitupulu Technology');
    expect(PRIVACY_POLICY_HTML).toContain('info@dntech.id');
    expect(PRIVACY_POLICY_HTML).toContain('Pasal 21');
  });

  it('terms cite UU ITE electronic contracts and evidence', () => {
    expect(TERMS_OF_SERVICE_HTML).toContain('Undang-Undang Nomor 1 Tahun 2024');
    expect(TERMS_OF_SERVICE_HTML).toContain('Pasal 18');
    expect(TERMS_OF_SERVICE_HTML).toContain('Pasal 5');
    expect(TERMS_OF_SERVICE_HTML).toContain('/privacy');
  });
});
