import {
  BASE_LANGUAGE,
  TRANSLATION_LANGUAGE,
  dailyAutomationTarget,
  isDuplicateGeneratedDraft,
  isTopicAlreadyCovered,
  runBlogAutomationOnce,
  topicForSlot,
  validateGeneratedDraft,
} from '../../workers/blog-content.worker';
import prisma from '../../config/database';
import logger from '../../config/logger';
import { generateBlogDraft, translateBlogPost } from '../../services/GeminiContentService';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: { findFirst: jest.fn() },
    blogPost: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
    blogPostTranslation: { findFirst: jest.fn(), create: jest.fn() },
    blogAutomationState: { findUnique: jest.fn(), upsert: jest.fn() },
  },
}));

jest.mock('../../config/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../../services/CacheService', () => ({
  cacheService: { clear: jest.fn() },
}));

jest.mock('../../services/GeminiContentService', () => ({
  BLOG_MIN_WORDS: 500,
  generateBlogDraft: jest.fn(),
  translateBlogPost: jest.fn(),
}));

const db = prisma as unknown as {
  user: { findFirst: jest.Mock };
  blogPost: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; updateMany: jest.Mock };
  blogPostTranslation: { findFirst: jest.Mock; create: jest.Mock };
  blogAutomationState: { findUnique: jest.Mock; upsert: jest.Mock };
};
const log = logger as unknown as { info: jest.Mock; warn: jest.Mock; error: jest.Mock };
const generateBlogDraftMock = generateBlogDraft as unknown as jest.Mock;
const translateBlogPostMock = translateBlogPost as unknown as jest.Mock;

function longHtml(sentence: string) {
  return Array.from(
    { length: 32 },
    (_, index) => `<h2>${index === 0 ? 'Langkah pertama' : 'Catatan implementasi'}</h2><p>${sentence} Tim perlu menyepakati pemilik proses, data yang dipakai, batas akses, serta cara mengukur hasil agar perubahan software benar-benar membantu pekerjaan harian.</p>`,
  ).join('');
}

const indonesianDraft = {
  title: 'Cara merapikan workflow bisnis',
  slug: 'cara-merapikan-workflow-bisnis',
  excerpt: 'Panduan singkat untuk memulai.',
  content: longHtml('DN Tech membantu tim memetakan workflow, memilih scope, dan menguji software sebelum dipakai.'),
  category: 'Workflow bisnis',
  tags: ['workflow'],
  seoTitle: 'Cara Merapikan Workflow Bisnis',
  seoDescription: 'Panduan praktis memetakan workflow bisnis sebelum membangun software yang tepat.',
  featuredImageId: 'media-1',
  imageProvider: 'openai' as const,
};

const englishTranslation = {
  title: 'How to Clean Up Your Business Workflow',
  slug: 'how-to-clean-up-your-business-workflow',
  excerpt: 'A short guide to getting started.',
  content: longHtml('DN Tech helps teams map workflows, pick scope, and test software before rollout.'),
  category: 'Business workflow',
  tags: ['workflow'],
  seoTitle: 'How to Clean Up Your Business Workflow',
  seoDescription: 'A practical guide to mapping your business workflow before building the right software.',
};

describe('blog content worker guards', () => {
  it('caps the automation target at the available slots', () => {
    expect(dailyAutomationTarget(4, '10')).toBe(4);
    expect(dailyAutomationTarget(4, '2')).toBe(2);
    expect(dailyAutomationTarget(4, 'invalid')).toBe(4);
  });

  it('writes the base row in Indonesian and translates to English', () => {
    expect(BASE_LANGUAGE.code).toBe('id');
    expect(TRANSLATION_LANGUAGE.code).toBe('en');
  });

  it('rotates topics deterministically by day and slot', () => {
    const first = topicForSlot('2026-09-26', 0);
    const second = topicForSlot('2026-09-26', 1);

    expect(first.topic).not.toBe(second.topic);
    expect(first.keywords).toContain('approval workflow');
  });

  it('recognizes a topic already used by the automation tag', () => {
    const topic = topicForSlot('2026-09-26', 0).topic;

    expect(isTopicAlreadyCovered(topic, {
      title: 'Judul yang berbeda',
      slug: 'judul-yang-berbeda',
      excerpt: null,
      category: null,
      tags: [`automation-topic:${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`],
    })).toBe(true);
  });

  it('recognizes a changed AI title that still covers the same theme', () => {
    expect(isDuplicateGeneratedDraft(
      { title: 'Scope MVP: fitur penting tanpa fondasi teknis yang rapuh', slug: 'scope-mvp-fitur-penting' },
      'Cara menentukan scope MVP agar fitur penting selesai lebih cepat tanpa mengorbankan fondasi teknis',
      [{
        title: 'Menentukan scope MVP untuk proyek aplikasi',
        slug: 'menentukan-scope-mvp-untuk-proyek-aplikasi',
        excerpt: 'Panduan product engineering untuk memprioritaskan fitur penting.',
        category: 'Product engineering',
        tags: [],
      }],
    )).toBe(true);
  });

  it('rejects short, unstructured, or AI-placeholder content', () => {
    const result = validateGeneratedDraft({
      title: 'Artikel',
      slug: 'artikel',
      excerpt: 'Ringkasan',
      content: '<p>Saya adalah AI dan ini pendek.</p>',
      category: 'Umum',
      tags: [],
      seoTitle: 'Artikel',
      seoDescription: 'Deskripsi artikel',
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('draft_contains_forbidden_ai_or_placeholder_phrase');
  });

  it('accepts a structured article in the configured length range', () => {
    const result = validateGeneratedDraft(indonesianDraft);

    expect(result.valid).toBe(true);
    expect(result.words).toBeGreaterThanOrEqual(500);
  });
});

describe('runBlogAutomationOnce dual-language creation', () => {
  // 2026-10-04T05:00:00Z is 12:00 in Asia/Jakarta, so the 09:00 slot is due.
  const now = new Date('2026-10-04T05:00:00Z');

  beforeEach(() => {
    process.env.BLOG_AUTOMATION_ENABLED = 'true';
    delete process.env.BLOG_AUTOMATION_DRY_RUN;
    delete process.env.BLOG_AUTOMATION_PUBLISH_MODE;
    delete process.env.BLOG_AUTOMATION_SLOTS;

    db.blogPost.findMany.mockResolvedValue([]);
    db.blogPost.findFirst.mockResolvedValue(null);
    db.blogPost.updateMany.mockResolvedValue({ count: 0 });
    db.blogPost.create.mockResolvedValue({ id: 'post-1', title: indonesianDraft.title });
    db.blogPostTranslation.findFirst.mockResolvedValue(null);
    db.blogPostTranslation.create.mockResolvedValue({ id: 'translation-1' });
    db.blogAutomationState.findUnique.mockResolvedValue(null);
    db.blogAutomationState.upsert.mockResolvedValue({});
    db.user.findFirst.mockResolvedValue({ id: 'author-1' });

    generateBlogDraftMock.mockResolvedValue(indonesianDraft);
    translateBlogPostMock.mockResolvedValue(englishTranslation);
  });

  afterEach(() => {
    delete process.env.BLOG_AUTOMATION_ENABLED;
  });

  it('creates the Indonesian base row and the English translation in one run', async () => {
    const result = await runBlogAutomationOnce(now);

    expect(result.created).toBe(true);
    expect(result.translated).toBe(true);

    expect(generateBlogDraftMock).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'Bahasa Indonesia' }),
      'author-1',
    );

    const baseRow = db.blogPost.create.mock.calls[0][0].data;
    expect(baseRow.locale).toBe('id');
    expect(baseRow.tags).toContain('language:id');
    expect(baseRow.tags).not.toContain('language:en');

    expect(translateBlogPostMock).toHaveBeenCalledWith(
      expect.objectContaining({ sourceLocale: 'id', targetLocale: 'en', title: indonesianDraft.title }),
    );

    const translationRow = db.blogPostTranslation.create.mock.calls[0][0].data;
    expect(translationRow).toMatchObject({
      postId: 'post-1',
      locale: 'en',
      title: englishTranslation.title,
      slug: 'how-to-clean-up-your-business-workflow',
      isMachine: true,
    });
    expect(translationRow.tags).toContain('language:en');
    expect(translationRow.tags).toContain('dntech-automation');
  });

  it('saves the English translation even when the base row is only scheduled', async () => {
    // The daily publish target is already met, so the new post has to wait for
    // its slot — the translation must still be written in this run.
    db.blogPost.findMany.mockImplementation(async (args: { where?: { status?: string } }) => (
      args?.where?.status === 'published'
        ? Array.from({ length: 4 }, () => ({ tags: ['dntech-automation'] }))
        : []
    ));

    const result = await runBlogAutomationOnce(now);

    expect(db.blogPost.create.mock.calls[0][0].data.status).toBe('scheduled');
    expect(result.published).toBe(false);
    expect(db.blogPostTranslation.create).toHaveBeenCalledTimes(1);
  });

  it('suffixes the translation slug when it collides with an existing slug', async () => {
    db.blogPostTranslation.findFirst
      .mockResolvedValueOnce({ id: 'other-translation' })
      .mockResolvedValue(null);

    await runBlogAutomationOnce(now);

    expect(db.blogPostTranslation.create.mock.calls[0][0].data.slug)
      .toBe('how-to-clean-up-your-business-workflow-2');
  });

  it('keeps the post and logs the failure when translation fails', async () => {
    translateBlogPostMock.mockRejectedValue(new Error('AI_REQUEST_FAILED'));

    const result = await runBlogAutomationOnce(now);

    expect(result.created).toBe(true);
    expect(result.translated).toBe(false);
    expect(result.postId).toBe('post-1');
    expect(db.blogPost.create).toHaveBeenCalledTimes(1);
    expect(db.blogPostTranslation.create).not.toHaveBeenCalled();
    expect(log.error).toHaveBeenCalledWith(
      expect.objectContaining({ postId: 'post-1', locale: 'en' }),
      expect.stringContaining('translation failed'),
    );
  });
});
