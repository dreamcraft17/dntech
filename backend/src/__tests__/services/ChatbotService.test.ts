jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    chatConversation: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    service: { findMany: jest.fn() },
    product: { findMany: jest.fn() },
    blogPost: { findMany: jest.fn() },
    faq: { findMany: jest.fn() },
    portfolioItem: { findMany: jest.fn() },
    siteSettings: { findUnique: jest.fn() },
    brandContent: { findFirst: jest.fn() },
  },
}));

const mockPrisma = require('../../config/database').default;
const { answerChat, isCodingRequest, extractText } = require('../../services/ChatbotService');

describe('isCodingRequest', () => {
  it.each([
    ['dnCore ada API untuk integrasi ga?'],
    ['apakah dnPeople punya fitur payroll?'],
    ['produk kalian pakai react atau vue?'],
    ['dnShop bisa integrasi dengan sistem POS saya?'],
    ['harga paket API untuk dnCore berapa?'],
  ])('does NOT flag legitimate product question: "%s"', (message) => {
    expect(isCodingRequest(message)).toBe(false);
  });

  it.each([
    ['bisa bantu debug kode saya ga?'],
    ['tolong buatkan script python untuk scraping'],
    ['gimana cara menulis kode react yang benar'],
    ['ada syntax error di function saya, tolong perbaiki'],
    ['jelaskan cara membuat website dari nol'],
    ['apa itu algoritma sorting'],
  ])('flags actual coding request: "%s"', (message) => {
    expect(isCodingRequest(message)).toBe(true);
  });
});

describe('extractText', () => {
  it('joins and trims all text parts from the first candidate', () => {
    const response = {
      candidates: [{ content: { parts: [{ text: '  Halo ' }, { text: 'dunia ' }] } }],
    };
    expect(extractText(response)).toBe('Halo dunia');
  });

  it('returns empty string when candidates are missing', () => {
    expect(extractText({})).toBe('');
  });

  it('ignores parts without text', () => {
    const response = { candidates: [{ content: { parts: [{}, { text: 'ok' }] } }] };
    expect(extractText(response)).toBe('ok');
  });
});

describe('answerChat', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key';
    global.fetch = jest.fn();

    // resetMocks:true (jest.config.js) wipes implementations before every
    // test, so the retrievePublicContext() dependencies must be re-armed
    // with their "no results" defaults here every time (same convention as
    // LeadService.test.ts's beforeEach).
    mockPrisma.service.findMany.mockResolvedValue([]);
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.blogPost.findMany.mockResolvedValue([]);
    mockPrisma.faq.findMany.mockResolvedValue([]);
    mockPrisma.portfolioItem.findMany.mockResolvedValue([]);
    mockPrisma.siteSettings.findUnique.mockResolvedValue(null);
    mockPrisma.brandContent.findFirst.mockResolvedValue(null);
    mockPrisma.chatConversation.findUnique.mockResolvedValue(null);
  });

  it('refuses coding requests without calling Gemini and persists the refusal', async () => {
    mockPrisma.chatConversation.create.mockResolvedValue({ id: 'conv-1', messageCount: 2 });

    const result = await answerChat({ message: 'tolong buatkan script python', visitorId: 'visitor-abc123' });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.answer).toMatch(/tidak dapat membantu pertanyaan tentang coding/i);
    expect(mockPrisma.chatConversation.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ visitorId: 'visitor-abc123' }) }),
    );
  });

  it('falls back to a fresh conversation when conversationId belongs to a different visitor', async () => {
    mockPrisma.chatConversation.findUnique.mockResolvedValue({
      id: 'conv-owned-by-someone-else',
      visitorId: 'other-visitor-999',
      messages: [{ role: 'user', content: 'riwayat rahasia orang lain' }],
    });
    mockPrisma.chatConversation.create.mockResolvedValue({ id: 'conv-new', messageCount: 2 });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'Halo!' }] } }] }),
    });

    const result = await answerChat({
      message: 'apakah dnCore ada API?',
      conversationId: '11111111-1111-4111-8111-111111111111',
      visitorId: 'my-real-visitor-id',
    });

    // must NOT reuse/update someone else's conversation, and must not leak their history into the Gemini call
    expect(mockPrisma.chatConversation.update).not.toHaveBeenCalled();
    expect(mockPrisma.chatConversation.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ visitorId: 'my-real-visitor-id' }) }),
    );
    const sentBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(JSON.stringify(sentBody)).not.toContain('riwayat rahasia orang lain');
    expect(result.conversationId).toBe('conv-new');
  });

  it('throws 404 when conversationId does not exist at all', async () => {
    mockPrisma.chatConversation.findUnique.mockResolvedValue(null);

    await expect(
      answerChat({ message: 'halo', conversationId: '22222222-2222-4222-8222-222222222222', visitorId: 'visitor-v1' }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('drops corrupted history entries instead of crashing the request', async () => {
    mockPrisma.chatConversation.findUnique.mockResolvedValue({
      id: 'conv-2',
      visitorId: 'visitor-abc123',
      messages: [{ role: 'user', content: 'valid pesan lama' }, { totally: 'not a valid message shape' }],
    });
    mockPrisma.chatConversation.update.mockResolvedValue({ id: 'conv-2', messageCount: 4 });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'Baik, ada lagi?' }] } }] }),
    });

    const result = await answerChat({
      message: 'lanjut dari sebelumnya',
      conversationId: '33333333-3333-4333-8333-333333333333',
      visitorId: 'visitor-abc123',
    });

    expect(result.answer).toBe('Baik, ada lagi?');
  });

  it('throws AI_TIMEOUT when the Gemini request is aborted', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => {
      const err = new Error('aborted');
      err.name = 'AbortError';
      return Promise.reject(err);
    });

    await expect(
      answerChat({ message: 'apa saja layanan DN Tech?', visitorId: 'visitor-timeout-1' }),
    ).rejects.toMatchObject({ code: 'AI_TIMEOUT' });
  });

  it('throws AI_NOT_CONFIGURED when GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(
      answerChat({ message: 'apa saja layanan DN Tech?', visitorId: 'visitor-no-key-1' }),
    ).rejects.toMatchObject({ code: 'AI_NOT_CONFIGURED' });
  });
});
