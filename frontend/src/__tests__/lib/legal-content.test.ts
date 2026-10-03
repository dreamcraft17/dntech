import {
  PRIVACY_POLICY_HTML,
  PRIVACY_POLICY_HTML_EN,
  TERMS_OF_SERVICE_HTML,
  TERMS_OF_SERVICE_HTML_EN,
  getLegalFallback,
  localizeLegalLinks,
} from '@/lib/legal-content';

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

describe('English legal fallbacks', () => {
  it('privacy policy keeps the Indonesian statute and entity references', () => {
    expect(PRIVACY_POLICY_HTML_EN).toContain('Law No. 27 of 2022');
    expect(PRIVACY_POLICY_HTML_EN).toContain('PT. Dozer Napitupulu Technology');
    expect(PRIVACY_POLICY_HTML_EN).toContain('Article 21');
    expect(PRIVACY_POLICY_HTML_EN).toContain('info@dntech.id');
  });

  it('terms keep the UU ITE electronic contract and evidence clauses', () => {
    expect(TERMS_OF_SERVICE_HTML_EN).toContain('Law No. 1 of 2024');
    expect(TERMS_OF_SERVICE_HTML_EN).toContain('Article 18');
    expect(TERMS_OF_SERVICE_HTML_EN).toContain('Article 5');
    expect(TERMS_OF_SERVICE_HTML_EN).toContain('/privacy');
  });

  it('matches the same number of sections as the Indonesian copy', () => {
    const count = (html: string) => (html.match(/<h2>/g) || []).length;
    expect(count(PRIVACY_POLICY_HTML_EN)).toBe(count(PRIVACY_POLICY_HTML));
    expect(count(TERMS_OF_SERVICE_HTML_EN)).toBe(count(TERMS_OF_SERVICE_HTML));
  });
});

describe('getLegalFallback', () => {
  it('returns the locale-matching copy, defaulting to Indonesian', () => {
    expect(getLegalFallback('privacy', 'en')).toBe(PRIVACY_POLICY_HTML_EN);
    expect(getLegalFallback('privacy', 'id')).toBe(PRIVACY_POLICY_HTML);
    expect(getLegalFallback('terms', 'en')).toBe(TERMS_OF_SERVICE_HTML_EN);
    expect(getLegalFallback('terms', 'xx')).toBe(TERMS_OF_SERVICE_HTML);
  });
});

describe('localizeLegalLinks', () => {
  it('prefixes internal links and leaves external ones alone', () => {
    const html = '<a href="/privacy">x</a><a href="https://www.dntech.id">y</a><a href="mailto:info@dntech.id">z</a>';
    const out = localizeLegalLinks(html, 'en');
    expect(out).toContain('href="/en/privacy"');
    expect(out).toContain('href="https://www.dntech.id"');
    expect(out).toContain('href="mailto:info@dntech.id"');
  });
});
