jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    service: {
      findFirst: jest.fn(),
    },
    serviceTranslation: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
    activityLog: { create: jest.fn() },
  },
}));

jest.mock('../../services/CacheService', () => ({
  cacheService: { clear: jest.fn() },
}));

jest.mock('../../services/GeminiContentService', () => ({
  translateBlogPost: jest.fn(),
  translateService: jest.fn(),
}));

const prisma = require('../../config/database').default;
const { cacheService } = require('../../services/CacheService');
const { translateService } = require('../../services/GeminiContentService');
const {
  listServiceTranslations,
  upsertServiceTranslation,
  generateServiceTranslation,
  deleteServiceTranslation,
  makeServiceTranslationSlugChecker,
} = require('../../services/AdminContentService');

const baseService = {
  id: 'svc_1',
  name: 'Pengembangan Aplikasi Custom',
  slug: 'pengembangan-aplikasi-custom',
  description: 'Deskripsi panjang tentang layanan ini untuk bisnis.',
  features: [{ title: 'Konsultasi gratis', description: 'Diskusi kebutuhan.' }],
  category: 'Development',
  seoTitle: 'seo id',
  seoDescription: 'seo desc id',
  locale: 'id',
  deletedAt: null,
};

const editorPayload = {
  name: 'Real Name',
  description: 'Proper English description copy.',
};

describe('AdminContentService service translations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.service.findFirst.mockResolvedValue(null);
    prisma.serviceTranslation.findFirst.mockResolvedValue(null);
    prisma.serviceTranslation.findUnique.mockResolvedValue(null);
  });

  describe('makeServiceTranslationSlugChecker', () => {
    it('treats any base-service slug as taken', async () => {
      prisma.service.findFirst.mockResolvedValueOnce({ id: 'other' });
      const isTaken = makeServiceTranslationSlugChecker(prisma, 'svc_1', 'en');
      await expect(isTaken('real-name')).resolves.toBe(true);
    });

    it('allows the row to keep its own slug but rejects another row', async () => {
      const isTaken = makeServiceTranslationSlugChecker(prisma, 'svc_1', 'en');

      prisma.serviceTranslation.findFirst.mockResolvedValueOnce({ serviceId: 'svc_1', locale: 'en' });
      await expect(isTaken('real-name')).resolves.toBe(false);

      prisma.serviceTranslation.findFirst.mockResolvedValueOnce({ serviceId: 'svc_2', locale: 'en' });
      await expect(isTaken('real-name')).resolves.toBe(true);
    });
  });

  describe('listServiceTranslations', () => {
    it('returns the base locale, rows and the locales still missing', async () => {
      prisma.service.findFirst.mockResolvedValueOnce({
        ...baseService,
        translations: [{ locale: 'en', name: 'Real Name' }],
      });

      const result = await listServiceTranslations('svc_1');

      expect(result.baseLocale).toBe('id');
      expect(result.translations).toHaveLength(1);
      expect(result.missingLocales).toEqual([]);
    });

    it('404s for an unknown service', async () => {
      prisma.service.findFirst.mockResolvedValueOnce(null);
      await expect(listServiceTranslations('nope')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('upsertServiceTranslation', () => {
    it('stores editor input as a human translation, logs and clears cache', async () => {
      prisma.service.findFirst.mockResolvedValueOnce(baseService);
      prisma.serviceTranslation.upsert.mockResolvedValueOnce({ id: 'tr_1' });

      await upsertServiceTranslation('svc_1', 'en', editorPayload, 'user_1', '127.0.0.1');

      expect(prisma.serviceTranslation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { serviceId_locale: { serviceId: 'svc_1', locale: 'en' } },
          update: expect.objectContaining({ isMachine: false, slug: 'real-name' }),
        })
      );
      expect(prisma.activityLog.create).toHaveBeenCalledTimes(1);
      expect(cacheService.clear).toHaveBeenCalledTimes(1);
    });

    it('suffixes the slug when it collides with another row', async () => {
      prisma.service.findFirst.mockResolvedValueOnce(baseService);
      prisma.serviceTranslation.findFirst
        .mockResolvedValueOnce({ serviceId: 'svc_2', locale: 'en' })
        .mockResolvedValueOnce(null);
      prisma.serviceTranslation.upsert.mockResolvedValueOnce({ id: 'tr_1' });

      await upsertServiceTranslation('svc_1', 'en', editorPayload, 'user_1');

      expect(prisma.serviceTranslation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: expect.objectContaining({ slug: 'real-name-2' }) })
      );
    });

    it('rejects an unsupported locale and the base locale', async () => {
      await expect(upsertServiceTranslation('svc_1', 'zh', editorPayload, 'user_1')).rejects.toMatchObject({
        statusCode: 400,
        code: 'UNSUPPORTED_LOCALE',
      });

      prisma.service.findFirst.mockResolvedValueOnce(baseService);
      await expect(upsertServiceTranslation('svc_1', 'id', editorPayload, 'user_1')).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(prisma.serviceTranslation.upsert).not.toHaveBeenCalled();
    });

    it('rejects invalid editor payloads', async () => {
      prisma.service.findFirst.mockResolvedValueOnce(baseService);
      await expect(upsertServiceTranslation('svc_1', 'en', { name: '' }, 'user_1')).rejects.toThrow();
    });
  });

  describe('generateServiceTranslation', () => {
    const aiResult = {
      name: 'Generated Name',
      slug: 'generated-name',
      description: 'body',
      features: [{ title: 'A', description: 'B' }],
      category: 'Development',
      seoTitle: 'seo',
      seoDescription: 'seo desc',
    };

    it('translates from the base locale and stores machine output', async () => {
      prisma.service.findFirst.mockResolvedValueOnce(baseService);
      translateService.mockResolvedValueOnce(aiResult);
      prisma.serviceTranslation.upsert.mockResolvedValueOnce({ id: 'tr_1' });

      await generateServiceTranslation('svc_1', 'en', {}, 'user_1');

      expect(translateService).toHaveBeenCalledWith(
        expect.objectContaining({ sourceLocale: 'id', targetLocale: 'en' })
      );
      expect(prisma.serviceTranslation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: expect.objectContaining({ isMachine: true }) })
      );
      expect(cacheService.clear).toHaveBeenCalledTimes(1);
    });

    it('refuses to overwrite a human-edited translation without force', async () => {
      prisma.service.findFirst.mockResolvedValueOnce(baseService);
      prisma.serviceTranslation.findUnique.mockResolvedValueOnce({ id: 'tr_1', isMachine: false });

      await expect(generateServiceTranslation('svc_1', 'en', {}, 'user_1')).rejects.toMatchObject({
        statusCode: 409,
        code: 'HUMAN_TRANSLATION_EXISTS',
      });
      expect(translateService).not.toHaveBeenCalled();
    });

    it('overwrites a human-edited translation when force is passed', async () => {
      prisma.service.findFirst.mockResolvedValueOnce(baseService);
      prisma.serviceTranslation.findUnique.mockResolvedValueOnce({ id: 'tr_1', isMachine: false });
      translateService.mockResolvedValueOnce(aiResult);
      prisma.serviceTranslation.upsert.mockResolvedValueOnce({ id: 'tr_1' });

      await generateServiceTranslation('svc_1', 'en', { force: true }, 'user_1');

      expect(prisma.serviceTranslation.upsert).toHaveBeenCalled();
    });

    it('rejects translating into the base locale', async () => {
      prisma.service.findFirst.mockResolvedValueOnce(baseService);

      await expect(generateServiceTranslation('svc_1', 'id', {}, 'user_1')).rejects.toMatchObject({
        statusCode: 400,
        code: 'LOCALE_CONFLICT',
      });
      expect(translateService).not.toHaveBeenCalled();
    });
  });

  describe('deleteServiceTranslation', () => {
    it('deletes, logs and clears cache', async () => {
      prisma.serviceTranslation.findUnique.mockResolvedValueOnce({ id: 'tr_1' });

      await deleteServiceTranslation('svc_1', 'en', 'user_1');

      expect(prisma.serviceTranslation.delete).toHaveBeenCalledWith({ where: { id: 'tr_1' } });
      expect(prisma.activityLog.create).toHaveBeenCalledTimes(1);
      expect(cacheService.clear).toHaveBeenCalledTimes(1);
    });

    it('404s when there is nothing to delete', async () => {
      prisma.serviceTranslation.findUnique.mockResolvedValueOnce(null);
      await expect(deleteServiceTranslation('svc_1', 'en', 'user_1')).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});

export {};
