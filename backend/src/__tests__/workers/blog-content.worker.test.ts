import { topicForSlot, validateGeneratedDraft } from '../../workers/blog-content.worker';

describe('blog content worker guards', () => {
  it('rotates topics deterministically by day and slot', () => {
    const first = topicForSlot('2026-09-26', 0);
    const second = topicForSlot('2026-09-26', 1);

    expect(first.topic).not.toBe(second.topic);
    expect(first.keywords).toContain('approval workflow');
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
    const paragraph = 'DN Tech membantu tim memetakan workflow, memilih scope, dan menguji software sebelum dipakai dalam operasi harian.';
    const content = Array.from(
      { length: 32 },
      (_, index) => `<h2>${index === 0 ? 'Langkah yang bisa dilakukan' : 'Catatan untuk implementasi'}</h2><p>${paragraph} Tim perlu menyepakati pemilik proses, data yang dipakai, batas akses, serta cara mengukur hasil agar perubahan software benar-benar membantu pekerjaan.</p>`,
    ).join('');
    const result = validateGeneratedDraft({
      title: 'Cara merapikan workflow bisnis',
      slug: 'cara-merapikan-workflow-bisnis',
      excerpt: 'Panduan singkat untuk memulai.',
      content,
      category: 'Workflow bisnis',
      tags: ['workflow'],
      seoTitle: 'Cara Merapikan Workflow Bisnis',
      seoDescription: 'Panduan praktis untuk memetakan workflow bisnis sebelum membangun software yang tepat.',
    });

    expect(result.valid).toBe(true);
    expect(result.words).toBeGreaterThanOrEqual(500);
  });
});
