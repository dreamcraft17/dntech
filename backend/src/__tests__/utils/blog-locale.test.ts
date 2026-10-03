import {
  DEFAULT_LOCALE,
  SITE_LOCALES,
  isSiteLocale,
  normalizeLocale,
  resolveBlogPost,
  uniqueTranslationSlug,
} from '../../utils/blog-locale';

const basePost = {
  id: 'p1',
  locale: 'id',
  title: 'Gaji karyawan',
  slug: 'gaji-karyawan',
  content: 'Konten penggajian',
  excerpt: 'Ringkasan',
  category: 'Teknologi',
  tags: ['hr'],
  seoTitle: 'SEO id',
  seoDescription: 'Deskripsi id',
  viewCount: 4,
};

const englishTranslation = {
  locale: 'en',
  title: 'Payroll',
  slug: 'payroll',
  content: 'Payroll content',
  excerpt: 'Summary',
  category: 'Technology',
  tags: ['hr-en'],
  seoTitle: 'SEO en',
  seoDescription: 'Description en',
  isMachine: true,
};

describe('blog-locale', () => {
  describe('isSiteLocale / SITE_LOCALES', () => {
    it('accepts only the supported site locales', () => {
      expect(SITE_LOCALES).toEqual(['id', 'en']);
      expect(isSiteLocale('id')).toBe(true);
      expect(isSiteLocale('en')).toBe(true);
      expect(isSiteLocale('zh')).toBe(false);
      expect(isSiteLocale(undefined)).toBe(false);
    });
  });

  describe('normalizeLocale', () => {
    it('prefers an explicit query value', () => {
      expect(normalizeLocale('en', 'id-ID')).toBe('en');
      expect(normalizeLocale('id', 'en-US')).toBe('id');
    });

    it('falls back to Accept-Language, then to the default locale', () => {
      expect(normalizeLocale(undefined, 'en-GB,en;q=0.9')).toBe('en');
      expect(normalizeLocale('zh', 'en-US')).toBe('en');
      expect(normalizeLocale(undefined, 'fr-FR')).toBe(DEFAULT_LOCALE);
      expect(normalizeLocale(undefined)).toBe('id');
    });
  });

  describe('resolveBlogPost', () => {
    it('returns the base row untouched when it is already in the requested locale', () => {
      const resolved = resolveBlogPost({ ...basePost, translations: [englishTranslation] }, 'id');

      expect(resolved.title).toBe('Gaji karyawan');
      expect(resolved.isFallback).toBe(false);
      expect(resolved.isMachineTranslated).toBe(false);
      expect(resolved.locale).toBe('id');
      expect(resolved.requestedLocale).toBe('id');
      expect(resolved.availableLocales).toEqual(['id', 'en']);
      expect(resolved).not.toHaveProperty('translations');
    });

    it('merges the matching translation over the base row', () => {
      const resolved = resolveBlogPost({ ...basePost, translations: [englishTranslation] }, 'en');

      expect(resolved.title).toBe('Payroll');
      expect(resolved.slug).toBe('payroll');
      expect(resolved.category).toBe('Technology');
      expect(resolved.viewCount).toBe(4);
      expect(resolved.isMachineTranslated).toBe(true);
      expect(resolved.isFallback).toBe(false);
      expect(resolved).not.toHaveProperty('translations');
    });

    it('flags a fallback when the requested locale is missing', () => {
      const resolved = resolveBlogPost({ ...basePost, translations: [] }, 'en');

      expect(resolved.title).toBe('Gaji karyawan');
      expect(resolved.locale).toBe('id');
      expect(resolved.requestedLocale).toBe('en');
      expect(resolved.isFallback).toBe(true);
      expect(resolved.availableLocales).toEqual(['id']);
    });

    it('keeps base values for fields the translation leaves empty', () => {
      const resolved = resolveBlogPost(
        {
          ...basePost,
          translations: [{ ...englishTranslation, category: null, excerpt: null, isMachine: false }],
        },
        'en'
      );

      expect(resolved.category).toBe('Teknologi');
      expect(resolved.excerpt).toBe('Ringkasan');
      expect(resolved.isMachineTranslated).toBe(false);
    });
  });

  describe('uniqueTranslationSlug', () => {
    it('returns the desired slug when free', async () => {
      await expect(uniqueTranslationSlug('payroll', async () => false)).resolves.toBe('payroll');
    });

    it('suffixes until the slug is free', async () => {
      const taken = new Set(['payroll', 'payroll-2']);
      await expect(uniqueTranslationSlug('payroll', async (c) => taken.has(c))).resolves.toBe('payroll-3');
    });
  });
});
