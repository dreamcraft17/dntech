import { DEFAULT_ADVANTAGES, resolveHomeContent } from '@/lib/homepage-content';

describe('homepage-content', () => {
  it('avoids traction inflation in default advantages', () => {
    const techStack = DEFAULT_ADVANTAGES.find((item) => item.title === 'Tech Stack Modern');
    expect(techStack).toBeDefined();
    expect(techStack?.description).not.toMatch(/ratusan|jutaan user/i);
    expect(techStack?.description).toMatch(/first-party|SaaS/i);
  });

  it('resolves hero CTAs from CMS with code defaults as fallback', () => {
    const defaults = resolveHomeContent({});
    expect(defaults.heroPrimaryCta).toEqual({
      label: 'Konsultasi Gratis — 30 Menit',
      href: '/contact',
    });
    expect(defaults.heroSecondaryCta).toEqual({
      label: 'Lihat Produk',
      href: '/products',
    });

    const cms = resolveHomeContent({
      homeContent: {
        heroPrimaryCta: { label: 'Jadwalkan Demo', href: '/quiz' },
      },
    });
    expect(cms.heroPrimaryCta).toEqual({ label: 'Jadwalkan Demo', href: '/quiz' });
    expect(cms.heroSecondaryCta.href).toBe('/products');
  });
});
