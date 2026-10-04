jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    service: { findMany: jest.fn() },
    serviceTranslation: { findFirst: jest.fn(), upsert: jest.fn() },
    $disconnect: jest.fn(),
  })),
}));

jest.mock('../../services/GeminiContentService', () => ({
  translateService: jest.fn(),
}));

jest.mock('../../config/database', () => ({ __esModule: true, default: {} }));

const {
  parseArgs,
  missingLocalesFor,
} = require('../../../scripts/backfill-service-translations');

describe('backfill-service-translations helpers', () => {
  describe('parseArgs', () => {
    it('defaults to a real, unlimited run', () => {
      const options = parseArgs([]);
      expect(options).toMatchObject({
        dryRun: false,
        force: false,
        forceHuman: false,
        limit: undefined,
        locale: undefined,
        service: undefined,
      });
      expect(options.delayMs).toBeGreaterThan(0);
    });

    it('reads --flag=value and --flag value forms', () => {
      expect(parseArgs(['--limit=5', '--locale=en', '--service=my-slug']).limit).toBe(5);
      expect(parseArgs(['--limit', '3']).limit).toBe(3);
      expect(parseArgs(['--locale', 'id']).locale).toBe('id');
      expect(parseArgs(['--service=my-slug']).service).toBe('my-slug');
    });

    it('picks up the boolean flags', () => {
      const options = parseArgs(['--dry-run', '--force', '--force-human']);
      expect(options).toMatchObject({ dryRun: true, force: true, forceHuman: true });
    });

    it('rejects a locale the site does not serve', () => {
      expect(() => parseArgs(['--locale=zh'])).toThrow(/--locale/);
    });
  });

  describe('missingLocalesFor', () => {
    it('pairs an id service with en and vice versa', () => {
      expect(missingLocalesFor('id', [])).toEqual(['en']);
      expect(missingLocalesFor('en', [])).toEqual(['id']);
    });

    it('is resumable: nothing is missing once the counterpart exists', () => {
      expect(missingLocalesFor('id', ['en'])).toEqual([]);
    });
  });
});

export {};
