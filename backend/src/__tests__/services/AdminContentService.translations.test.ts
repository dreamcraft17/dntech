jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    blogPost: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    blogPostTranslation: {
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
}));

const prisma = require('../../config/database').default;
const { cacheService } = require('../../services/CacheService');
const { translateBlogPost } = require('../../services/GeminiContentService');
const {
  listBlogTranslations,
  upsertBlogTranslation,
  generateBlogTranslation,
  deleteBlogTranslation,
  makeTranslationSlugChecker,
  createBlogPost,
  updateBlogPost,
} = require('../../services/AdminContentService');

const basePost = {
  id: 'post_1',
  title: 'Judul Asli',
  slug: 'judul-asli',
  content: 'Isi panjang sekali '.repeat(10),
  excerpt: 'ringkasan',
  category: 'Engineering',
  tags: ['a', 'b'],
  seoTitle: 'seo id',
  seoDescription: 'seo desc id',
  locale: 'id',
  deletedAt: null,
};

const editorPayload = {
  title: 'Real Title',
  content: 'Proper English body copy.',
  excerpt: 'summary',
  tags: ['a'],
};

describe('AdminContentService blog translations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.blogPost.findFirst.mockResolvedValue(null);
    prisma.blogPostTranslation.findFirst.mockResolvedValue(null);
    prisma.blogPostTranslation.findUnique.mockResolvedValue(null);
  });

  describe('makeTranslationSlugChecker', () => {
    it('treats any base-post slug as taken', async () => {
      prisma.blogPost.findFirst.mockResolvedValueOnce({ id: 'other' });
      const isTaken = makeTranslationSlugChecker(prisma, 'post_1', 'en');
      await expect(isTaken('real-title')).resolves.toBe(true);
    });

    it('allows the row to keep its own slug but rejects another row', async () => {
      const isTaken = makeTranslationSlugChecker(prisma, 'post_1', 'en');

      prisma.blogPostTranslation.findFirst.mockResolvedValueOnce({ postId: 'post_1', locale: 'en' });
      await expect(isTaken('real-title')).resolves.toBe(false);

      prisma.blogPostTranslation.findFirst.mockResolvedValueOnce({ postId: 'post_2', locale: 'en' });
      await expect(isTaken('real-title')).resolves.toBe(true);
    });
  });

  describe('listBlogTranslations', () => {
    it('returns the base locale, rows and the locales still missing', async () => {
      prisma.blogPost.findFirst.mockResolvedValueOnce({
        ...basePost,
        translations: [{ locale: 'en', title: 'Real Title' }],
      });

      const result = await listBlogTranslations('post_1');

      expect(result.baseLocale).toBe('id');
      expect(result.translations).toHaveLength(1);
      expect(result.missingLocales).toEqual([]);
    });

    it('reports a Mandarin base row as missing both site locales', async () => {
      prisma.blogPost.findFirst.mockResolvedValueOnce({ ...basePost, locale: 'zh', translations: [] });

      const result = await listBlogTranslations('post_1');

      expect(result.baseLocale).toBe('zh');
      expect(result.missingLocales).toEqual(['id', 'en']);
    });

    it('404s for an unknown post', async () => {
      prisma.blogPost.findFirst.mockResolvedValueOnce(null);
      await expect(listBlogTranslations('nope')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('upsertBlogTranslation', () => {
    it('stores editor input as a human translation, logs and clears cache', async () => {
      prisma.blogPost.findFirst.mockResolvedValueOnce(basePost);
      prisma.blogPostTranslation.upsert.mockResolvedValueOnce({ id: 'tr_1' });

      await upsertBlogTranslation('post_1', 'en', editorPayload, 'user_1', '127.0.0.1');

      expect(prisma.blogPostTranslation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { postId_locale: { postId: 'post_1', locale: 'en' } },
          update: expect.objectContaining({ isMachine: false, slug: 'real-title' }),
        })
      );
      expect(prisma.activityLog.create).toHaveBeenCalledTimes(1);
      expect(cacheService.clear).toHaveBeenCalledTimes(1);
    });

    it('suffixes the slug when it collides with another row', async () => {
      prisma.blogPost.findFirst.mockResolvedValueOnce(basePost);
      prisma.blogPostTranslation.findFirst
        .mockResolvedValueOnce({ postId: 'post_2', locale: 'en' })
        .mockResolvedValueOnce(null);
      prisma.blogPostTranslation.upsert.mockResolvedValueOnce({ id: 'tr_1' });

      await upsertBlogTranslation('post_1', 'en', editorPayload, 'user_1');

      expect(prisma.blogPostTranslation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: expect.objectContaining({ slug: 'real-title-2' }) })
      );
    });

    it('rejects an unsupported locale and the base locale', async () => {
      await expect(upsertBlogTranslation('post_1', 'zh', editorPayload, 'user_1')).rejects.toMatchObject({
        statusCode: 400,
        code: 'UNSUPPORTED_LOCALE',
      });

      prisma.blogPost.findFirst.mockResolvedValueOnce(basePost);
      await expect(upsertBlogTranslation('post_1', 'id', editorPayload, 'user_1')).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(prisma.blogPostTranslation.upsert).not.toHaveBeenCalled();
    });

    it('rejects invalid editor payloads', async () => {
      prisma.blogPost.findFirst.mockResolvedValueOnce(basePost);
      await expect(upsertBlogTranslation('post_1', 'en', { title: '' }, 'user_1')).rejects.toThrow();
    });
  });

  describe('generateBlogTranslation', () => {
    const aiResult = {
      title: 'Generated Title',
      slug: 'generated-title',
      excerpt: 'ex',
      content: 'body',
      category: 'Engineering',
      tags: ['a'],
      seoTitle: 'seo',
      seoDescription: 'seo desc',
    };

    it('translates from the base locale and stores machine output', async () => {
      prisma.blogPost.findFirst.mockResolvedValueOnce(basePost);
      translateBlogPost.mockResolvedValueOnce(aiResult);
      prisma.blogPostTranslation.upsert.mockResolvedValueOnce({ id: 'tr_1' });

      await generateBlogTranslation('post_1', 'en', {}, 'user_1');

      expect(translateBlogPost).toHaveBeenCalledWith(
        expect.objectContaining({ sourceLocale: 'id', targetLocale: 'en' })
      );
      expect(prisma.blogPostTranslation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: expect.objectContaining({ isMachine: true }) })
      );
      expect(cacheService.clear).toHaveBeenCalledTimes(1);
    });

    it('refuses to overwrite a human-edited translation without force', async () => {
      prisma.blogPost.findFirst.mockResolvedValueOnce(basePost);
      prisma.blogPostTranslation.findUnique.mockResolvedValueOnce({ id: 'tr_1', isMachine: false });

      await expect(generateBlogTranslation('post_1', 'en', {}, 'user_1')).rejects.toMatchObject({
        statusCode: 409,
        code: 'HUMAN_TRANSLATION_EXISTS',
      });
      expect(translateBlogPost).not.toHaveBeenCalled();
    });

    it('overwrites a human-edited translation when force is passed', async () => {
      prisma.blogPost.findFirst.mockResolvedValueOnce(basePost);
      prisma.blogPostTranslation.findUnique.mockResolvedValueOnce({ id: 'tr_1', isMachine: false });
      translateBlogPost.mockResolvedValueOnce(aiResult);
      prisma.blogPostTranslation.upsert.mockResolvedValueOnce({ id: 'tr_1' });

      await generateBlogTranslation('post_1', 'en', { force: true }, 'user_1');

      expect(prisma.blogPostTranslation.upsert).toHaveBeenCalled();
    });

    it('translates a Mandarin base row into Indonesian', async () => {
      prisma.blogPost.findFirst.mockResolvedValueOnce({ ...basePost, locale: 'zh' });
      translateBlogPost.mockResolvedValueOnce(aiResult);
      prisma.blogPostTranslation.upsert.mockResolvedValueOnce({ id: 'tr_1' });

      await generateBlogTranslation('post_1', 'id', {}, 'user_1');

      expect(translateBlogPost).toHaveBeenCalledWith(
        expect.objectContaining({ sourceLocale: 'zh', targetLocale: 'id' })
      );
    });
  });

  describe('deleteBlogTranslation', () => {
    it('deletes, logs and clears cache', async () => {
      prisma.blogPostTranslation.findUnique.mockResolvedValueOnce({ id: 'tr_1' });

      await deleteBlogTranslation('post_1', 'en', 'user_1');

      expect(prisma.blogPostTranslation.delete).toHaveBeenCalledWith({ where: { id: 'tr_1' } });
      expect(prisma.activityLog.create).toHaveBeenCalledTimes(1);
      expect(cacheService.clear).toHaveBeenCalledTimes(1);
    });

    it('404s when there is nothing to delete', async () => {
      prisma.blogPostTranslation.findUnique.mockResolvedValueOnce(null);
      await expect(deleteBlogTranslation('post_1', 'en', 'user_1')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('base row locale', () => {
    it('stamps a created post with the default locale when none is given', async () => {
      prisma.blogPost.create.mockResolvedValueOnce({ id: 'post_1' });

      await createBlogPost({ title: 'Judul', content: 'x'.repeat(120) }, 'user_1');

      expect(prisma.blogPost.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ locale: 'id' }) })
      );
    });

    it('honours an explicit locale on create', async () => {
      prisma.blogPost.create.mockResolvedValueOnce({ id: 'post_1' });

      await createBlogPost({ title: 'Title', content: 'x'.repeat(120), locale: 'en' }, 'user_1');

      expect(prisma.blogPost.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ locale: 'en' }) })
      );
    });

    it('refuses to move the base locale onto an existing translation locale', async () => {
      prisma.blogPostTranslation.findUnique.mockResolvedValueOnce({ id: 'tr_1' });

      await expect(updateBlogPost('post_1', { locale: 'en' })).rejects.toMatchObject({
        statusCode: 409,
        code: 'LOCALE_CONFLICT',
      });
      expect(prisma.blogPost.update).not.toHaveBeenCalled();
    });

    it('updates the base locale when it is free', async () => {
      prisma.blogPost.update.mockResolvedValueOnce({ id: 'post_1', locale: 'en' });

      await updateBlogPost('post_1', { locale: 'en' });

      expect(prisma.blogPost.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ locale: 'en' }) })
      );
    });
  });
});

export {};
