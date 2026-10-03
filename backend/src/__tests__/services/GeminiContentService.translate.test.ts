import { translateBlogPost } from '../../services/GeminiContentService';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('../../services/AdminMediaService', () => ({
  createMediaFromBuffer: jest.fn(),
}));

const sourcePost = {
  title: 'Cara merapikan workflow bisnis',
  excerpt: 'Panduan singkat untuk memulai.',
  content: '<h2>Langkah pertama</h2><p>DN Tech membantu tim memetakan workflow.</p>',
  category: 'Workflow bisnis',
  tags: ['workflow', 'automation-topic:cara-merapikan'],
  seoTitle: 'Cara Merapikan Workflow Bisnis',
  seoDescription: 'Panduan praktis memetakan workflow bisnis.',
  sourceLocale: 'id',
  targetLocale: 'en',
};

function openAIReply(payload: unknown) {
  return {
    ok: true,
    json: async () => ({ choices: [{ message: { content: JSON.stringify(payload) } }] }),
  } as unknown as Response;
}

describe('translateBlogPost', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'sk-test';
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.OPENAI_API_KEY;
  });

  it('returns the translated fields and a slug derived from the translated title', async () => {
    const fetchMock = jest.fn().mockResolvedValue(openAIReply({
      title: 'How to Clean Up Your Business Workflow',
      excerpt: 'A short guide to getting started.',
      content: '<h2>First step</h2><p>DN Tech helps teams map workflows.</p>',
      category: 'Business workflow',
      tags: ['workflow', 'automation-topic:cara-merapikan'],
      seoTitle: 'How to Clean Up Your Business Workflow',
      seoDescription: 'A practical guide to mapping your business workflow.',
    }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await translateBlogPost(sourcePost);

    expect(result.title).toBe('How to Clean Up Your Business Workflow');
    expect(result.slug).toBe('how-to-clean-up-your-business-workflow');
    expect(result.content).toContain('<h2>First step</h2>');
    expect(result.category).toBe('Business workflow');
    expect(result.tags).toEqual(['workflow', 'automation-topic:cara-merapikan']);

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    const prompt = body.messages[1].content as string;
    expect(prompt).toContain('Bahasa Indonesia');
    expect(prompt).toContain('DN Tech, dnPeople, dnCore, dnShopee');
    expect(prompt).toContain('Preserve the HTML structure and heading hierarchy EXACTLY');
  });

  it('clamps SEO fields and falls back to the title and excerpt', async () => {
    global.fetch = jest.fn().mockResolvedValue(openAIReply({
      title: 'A reasonably descriptive English headline about business workflows',
      excerpt: 'A short guide to getting started with workflow cleanup in your company.',
      content: '<p>Body.</p>',
      seoTitle: '',
      seoDescription: '',
    })) as unknown as typeof fetch;

    const result = await translateBlogPost(sourcePost);

    expect(result.seoTitle.length).toBeLessThanOrEqual(60);
    expect(result.seoTitle).toBe('A reasonably descriptive English headline about business wor');
    expect(result.seoDescription).toBe(result.excerpt);
    expect(result.category).toBeNull();
    expect(result.tags).toEqual([]);
  });

  it('fails with the module error conventions when the provider rejects', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'rate limited' } }),
    }) as unknown as typeof fetch;

    await expect(translateBlogPost(sourcePost)).rejects.toMatchObject({ code: 'AI_REQUEST_FAILED' });
  });

  it('refuses to run without any configured provider', async () => {
    delete process.env.OPENAI_API_KEY;

    await expect(translateBlogPost(sourcePost)).rejects.toMatchObject({ code: 'AI_NOT_CONFIGURED' });
  });
});
