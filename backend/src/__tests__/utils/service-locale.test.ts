import { resolveServiceRecord } from '../../utils/service-locale';

const baseService = {
  id: 's1',
  locale: 'id',
  name: 'Pengembangan Aplikasi Custom',
  slug: 'pengembangan-aplikasi-custom',
  description: 'Kami membangun aplikasi sesuai kebutuhan bisnis Anda.',
  features: [{ title: 'Konsultasi gratis', description: 'Diskusi kebutuhan sebelum mulai.' }],
  category: 'Development',
  seoTitle: 'SEO id',
  seoDescription: 'Deskripsi id',
  displayOrder: 1,
};

const englishTranslation = {
  locale: 'en',
  name: 'Custom Application Development',
  slug: 'custom-application-development',
  description: 'We build applications tailored to your business needs.',
  features: [{ title: 'Free consultation', description: 'We discuss requirements before starting.' }],
  category: 'Development',
  seoTitle: 'SEO en',
  seoDescription: 'Description en',
  isMachine: true,
};

describe('resolveServiceRecord', () => {
  it('returns the base row as-is when it already matches the requested locale', () => {
    const resolved = resolveServiceRecord({ ...baseService, translations: [englishTranslation] }, 'id');

    expect(resolved.name).toBe(baseService.name);
    expect(resolved.locale).toBe('id');
    expect(resolved.requestedLocale).toBe('id');
    expect(resolved.isFallback).toBe(false);
    expect(resolved.isMachineTranslated).toBe(false);
    expect(resolved.availableLocales.sort()).toEqual(['en', 'id']);
    expect(resolved.slugs).toEqual({ id: 'pengembangan-aplikasi-custom', en: 'custom-application-development' });
    expect('translations' in resolved).toBe(false);
  });

  it('merges the matching translation over the base row', () => {
    const resolved = resolveServiceRecord({ ...baseService, translations: [englishTranslation] }, 'en');

    expect(resolved.name).toBe('Custom Application Development');
    expect(resolved.slug).toBe('custom-application-development');
    expect(resolved.description).toBe(englishTranslation.description);
    expect(resolved.features).toEqual(englishTranslation.features);
    expect(resolved.locale).toBe('en');
    expect(resolved.isFallback).toBe(false);
    expect(resolved.isMachineTranslated).toBe(true);
  });

  it('falls back to the base row and flags isFallback when no translation exists', () => {
    const resolved = resolveServiceRecord({ ...baseService, translations: [] }, 'en');

    expect(resolved.name).toBe(baseService.name);
    expect(resolved.locale).toBe('id');
    expect(resolved.requestedLocale).toBe('en');
    expect(resolved.isFallback).toBe(true);
    expect(resolved.availableLocales).toEqual(['id']);
    expect(resolved.slugs).toEqual({ id: 'pengembangan-aplikasi-custom' });
  });

  it('reports a human-edited translation as not machine-translated', () => {
    const resolved = resolveServiceRecord(
      { ...baseService, translations: [{ ...englishTranslation, isMachine: false }] },
      'en'
    );

    expect(resolved.isMachineTranslated).toBe(false);
  });
});
