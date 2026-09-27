import { resolveOpenAIImageSize } from '../../services/GeminiContentService';

describe('resolveOpenAIImageSize', () => {
  it('defaults to 1536x1024', () => {
    expect(resolveOpenAIImageSize({})).toBe('1536x1024');
  });

  it('accepts supported OpenAI sizes', () => {
    expect(resolveOpenAIImageSize({ OPENAI_IMAGE_SIZE: '1024x1024' })).toBe('1024x1024');
    expect(resolveOpenAIImageSize({ OPENAI_IMAGE_SIZE: 'auto' })).toBe('auto');
  });

  it('maps legacy 16:9 presets to 1536x1024', () => {
    expect(resolveOpenAIImageSize({ OPENAI_IMAGE_SIZE: '1536x864' })).toBe('1536x1024');
  });
});
