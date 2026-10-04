import { translateService } from '../../services/GeminiContentService';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('../../services/AdminMediaService', () => ({
  createMediaFromBuffer: jest.fn(),
}));

const sourceService = {
  name: 'Pengembangan Aplikasi Custom',
  description: 'Kami membangun aplikasi sesuai kebutuhan bisnis Anda.',
  features: [{ title: 'Konsultasi gratis', description: 'Diskusi kebutuhan sebelum mulai.' }],
  category: 'Development',
  seoTitle: 'Pengembangan Aplikasi Custom',
  seoDescription: 'Jasa pengembangan aplikasi custom untuk bisnis Anda.',
  sourceLocale: 'id',
  targetLocale: 'en',
};

function openAIReply(payload: unknown) {
  return {
    ok: true,
    json: async () => ({ choices: [{ message: { content: JSON.stringify(payload) } }] }),
  } as unknown as Response;
}

describe('translateService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'sk-test';
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.OPENAI_API_KEY;
  });

  it('returns the translated fields and a slug derived from the translated name', async () => {
    const fetchMock = jest.fn().mockResolvedValue(openAIReply({
      name: 'Custom Application Development',
      description: 'We build applications tailored to your business needs.',
      features: [{ title: 'Free consultation', description: 'We discuss requirements before starting.' }],
      category: 'Development',
      seoTitle: 'Custom Application Development',
      seoDescription: 'Custom application development services for your business.',
    }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await translateService(sourceService);

    expect(result.name).toBe('Custom Application Development');
    expect(result.slug).toBe('custom-application-development');
    expect(result.description).toContain('tailored to your business');
    expect(result.features).toEqual([
      { title: 'Free consultation', description: 'We discuss requirements before starting.' },
    ]);
    expect(result.category).toBe('Development');

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    const prompt = body.messages[1].content as string;
    expect(prompt).toContain('Bahasa Indonesia');
    expect(prompt).toContain('DN Tech, dnPeople, dnCore, dnShopee');
  });

  it('clamps SEO fields and falls back to the name and description', async () => {
    global.fetch = jest.fn().mockResolvedValue(openAIReply({
      name: 'A reasonably descriptive English service name for custom development work',
      description: 'We build applications tailored to your business needs, end to end.',
      features: [],
      seoTitle: '',
      seoDescription: '',
    })) as unknown as typeof fetch;

    const result = await translateService(sourceService);

    expect(result.seoTitle.length).toBeLessThanOrEqual(60);
    expect(result.seoDescription).toBe(result.description.slice(0, 160));
    expect(result.category).toBeNull();
    expect(result.features).toEqual([]);
  });

  it('fails with the module error conventions when the provider rejects', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'rate limited' } }),
    }) as unknown as typeof fetch;

    await expect(translateService(sourceService)).rejects.toMatchObject({ code: 'AI_REQUEST_FAILED' });
  });

  it('refuses to run without any configured provider', async () => {
    delete process.env.OPENAI_API_KEY;

    await expect(translateService(sourceService)).rejects.toMatchObject({ code: 'AI_NOT_CONFIGURED' });
  });
});
