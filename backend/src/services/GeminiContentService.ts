import { z } from 'zod';
import { AppError } from '../utils/helpers';
import { createMediaFromBuffer } from './AdminMediaService';

const generateBlogSchema = z.object({
  topic: z.string().min(3).max(240),
  audience: z.string().max(160).optional(),
  tone: z.string().max(100).optional(),
  keywords: z.string().max(300).optional(),
  language: z.string().max(40).optional(),
  generateImage: z.boolean().optional().default(true),
});

const generatedBlogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(100),
  category: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
});

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

type GeminiImageResponse = {
  steps?: Array<{
    content?: Array<{
      type?: string;
      data?: string;
      mime_type?: string;
      mimeType?: string;
    }>;
  }>;
  error?: { message?: string };
};

function extractText(response: GeminiResponse) {
  return response.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim() || '';
}

function parseJson(text: string) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(cleaned) as unknown;
  } catch {
    throw new AppError(502, 'AI_INVALID_RESPONSE', 'Gemini mengembalikan format draft yang tidak valid');
  }
}

async function generateBlogImage(title: string, excerpt: string, apiKey: string, userId: string) {
  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
  const prompt = `
Buat gambar hero editorial rasio 16:9 untuk artikel blog DN Tech.
Judul: ${title}
Ringkasan: ${excerpt}

Gaya: modern, profesional, hangat, bersih, relevan untuk pemilik bisnis dan tim operasional di Indonesia.
Jangan gunakan teks, logo, watermark, wajah orang nyata, atau elemen merek pihak lain. Gunakan ilustrasi konseptual yang mudah dipahami sebagai cover artikel.
`.trim();

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/interactions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        model,
        input: prompt,
      }),
    },
  );

  const result = await response.json() as GeminiImageResponse;
  if (!response.ok) {
    throw new AppError(502, 'AI_IMAGE_REQUEST_FAILED', result.error?.message || 'Gemini gagal membuat gambar');
  }

  const image = result.steps?.flatMap((step) => step.content || [])
    .find((part) => part.type === 'image' && part.data);
  if (!image?.data) throw new AppError(502, 'AI_IMAGE_EMPTY_RESPONSE', 'Gemini tidak mengembalikan gambar');

  return createMediaFromBuffer(
    Buffer.from(image.data, 'base64'),
    image.mimeType || image.mime_type || 'image/png',
    `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'blog-cover'}.png`,
    userId,
  );
}

export async function generateBlogDraft(input: unknown, userId: string) {
  const data = generateBlogSchema.parse(input);
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new AppError(503, 'AI_NOT_CONFIGURED', 'GEMINI_API_KEY belum dikonfigurasi di backend');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const prompt = `
Anda adalah editor konten DN Tech, perusahaan software Indonesia. Buat satu DRAFT artikel blog yang informatif dan tidak mengarang fakta spesifik tentang DN Tech.

Topik: ${data.topic}
Target pembaca: ${data.audience || 'pemilik bisnis, founder startup, dan tim operasional di Indonesia'}
Gaya bahasa: ${data.tone || 'jelas, hangat, praktis, tidak kaku'}
Keyword yang boleh dipakai secara natural: ${data.keywords || 'software development Indonesia, aplikasi custom, workflow bisnis'}
Bahasa: ${data.language || 'Bahasa Indonesia'}

Aturan:
- Fokus pada masalah pembaca dan langkah yang bisa diterapkan.
- Jangan membuat klaim statistik, harga, studi kasus, atau nama klien tanpa sumber dari input.
- Gunakan HTML sederhana yang aman: <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>, dan <a href="...">.
- Jangan memakai markdown, script, style, iframe, atau atribut HTML selain href pada link.
- Struktur wajib: mulai dengan satu paragraf pembuka, gunakan <h2> untuk setiap bagian utama, <h3> untuk subbagian, dan gunakan list bila membahas langkah atau beberapa poin.
- Jangan menulis judul bagian sebagai paragraf biasa. Jangan memakai <strong> sebagai pengganti heading.
- Jangan mengulang excerpt di paragraf pembuka.
- Buat artikel sekitar 700-1000 kata dengan struktur yang nyaman dibaca.
- Kembalikan JSON valid saja, tanpa markdown fence, dengan field: title, slug, excerpt, content, category, tags, seoTitle, seoDescription.
- slug harus lowercase, singkat, dan memakai tanda hubung.
- seoTitle maksimal 60 karakter; seoDescription sekitar 140-160 karakter.
`.trim();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  const result = await response.json() as GeminiResponse;
  if (!response.ok) {
    throw new AppError(502, 'AI_REQUEST_FAILED', result.error?.message || 'Permintaan ke Gemini gagal');
  }

  const text = extractText(result);
  if (!text) throw new AppError(502, 'AI_EMPTY_RESPONSE', 'Gemini tidak mengembalikan draft');
  const draft = generatedBlogSchema.parse(parseJson(text));
  const featuredImage = data.generateImage
    ? await generateBlogImage(draft.title, draft.excerpt, apiKey, userId)
    : null;

  return {
    ...draft,
    featuredImageId: featuredImage?.id || '',
    featuredImageUrl: featuredImage?.url || '',
  };
}
