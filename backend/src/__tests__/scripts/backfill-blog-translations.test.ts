jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    blogPost: { findMany: jest.fn(), update: jest.fn() },
    blogPostTranslation: { findFirst: jest.fn(), upsert: jest.fn() },
    $disconnect: jest.fn(),
  })),
}));

jest.mock('../../services/GeminiContentService', () => ({
  translateBlogPost: jest.fn(),
}));

jest.mock('../../config/database', () => ({ __esModule: true, default: {} }));

const {
  parseArgs,
  localeFromTags,
  missingLocalesFor,
} = require('../../../scripts/backfill-blog-translations');

describe('backfill-blog-translations helpers', () => {
  describe('parseArgs', () => {
    it('defaults to a real, unlimited, locale-fixing run', () => {
      const options = parseArgs([]);
      expect(options).toMatchObject({
        dryRun: false,
        force: false,
        forceHuman: false,
        limit: undefined,
        locale: undefined,
        post: undefined,
        skipLocaleFix: false,
        localeFixOnly: false,
      });
      expect(options.delayMs).toBeGreaterThan(0);
    });

    it('reads --flag=value and --flag value forms', () => {
      expect(parseArgs(['--limit=5', '--locale=en', '--post=my-slug']).limit).toBe(5);
      expect(parseArgs(['--limit', '3']).limit).toBe(3);
      expect(parseArgs(['--locale', 'id']).locale).toBe('id');
      expect(parseArgs(['--post=my-slug']).post).toBe('my-slug');
    });

    it('picks up the boolean flags', () => {
      const options = parseArgs(['--dry-run', '--force', '--force-human', '--fix-locales', '--skip-locale-fix']);
      expect(options).toMatchObject({
        dryRun: true,
        force: true,
        forceHuman: true,
        localeFixOnly: true,
        skipLocaleFix: true,
      });
    });

    it('rejects a locale the site does not serve', () => {
      expect(() => parseArgs(['--locale=zh'])).toThrow(/--locale/);
    });
  });

  describe('localeFromTags', () => {
    it('reads the automation language tag', () => {
      expect(localeFromTags(['dntech-automation', 'language:en'])).toBe('en');
      expect(localeFromTags(['language:zh'])).toBe('zh');
    });

    it('returns null for hand-written posts with no language tag', () => {
      expect(localeFromTags(['dntech-automation'])).toBeNull();
      expect(localeFromTags(null)).toBeNull();
      expect(localeFromTags('language:en')).toBeNull();
      expect(localeFromTags(['language:'])).toBeNull();
    });
  });

  describe('missingLocalesFor', () => {
    it('pairs an id post with en and vice versa', () => {
      expect(missingLocalesFor('id', [])).toEqual(['en']);
      expect(missingLocalesFor('en', [])).toEqual(['id']);
    });

    it('asks for both locales when the base row is neither', () => {
      expect(missingLocalesFor('zh', [])).toEqual(['id', 'en']);
      expect(missingLocalesFor('zh', ['en'])).toEqual(['id']);
    });

    it('is resumable: nothing is missing once the counterpart exists', () => {
      expect(missingLocalesFor('id', ['en'])).toEqual([]);
      expect(missingLocalesFor('zh', ['id', 'en'])).toEqual([]);
    });
  });
});

export {};
