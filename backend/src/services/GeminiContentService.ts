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

const generateServiceSchema = z.object({
  prompt: z.string().min(3).max(1200),
  audience: z.string().max(160).optional(),
  tone: z.string().max(100).optional(),
  keywords: z.string().max(300).optional(),
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

const generatedServiceSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(10),
  category: z.string().optional().default(''),
  features: z.array(z.object({ title: z.string().min(1), description: z.string().optional() })).default([]),
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

/**
 * Gemini's `google_search` grounding tool cannot be combined with
 * `responseMimeType: 'application/json'` in the same request (the API
 * rejects structured output alongside tool use). So we run a separate
 * grounded research pass first, then feed its findings as required
 * context into the plain JSON-generation prompt below.
 */
async function researchTopic(topic: string, apiKey: string, model: string) {
  const researchPrompt = `
Cari informasi terkini dan akurat di internet tentang topik berikut, untuk dipakai sebagai bahan artikel blog: "${topic}".

Jika topik menyebut nama produk, perusahaan, atau orang tertentu, cari dan laporkan fakta spesifik tentang mereka (apa yang mereka lakukan, fitur produk, dll) — jangan mengarang jika tidak ketemu, katakan saja informasinya tidak ditemukan.
Rangkum temuan dalam poin-poin singkat berbahasa Indonesia, sebutkan sumber jika relevan.
`.trim();

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: researchPrompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0.3 },
        }),
      },
    );

    const result = await response.json() as GeminiResponse;
    if (!response.ok) return '';
    return extractText(result);
  } catch {
    // Research is best-effort: if it fails, fall back to the plain prompt
    // (still labeled honestly below) rather than blocking draft generation.
    return '';
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
  const research = await researchTopic(data.topic, apiKey, model);
  const researchBlock = research
    ? `Hasil riset internet (gunakan ini sebagai sumber fakta spesifik — nama produk, fitur, klaim tentang entitas yang disebut di topik; jangan mengarang di luar ini):\n${research}\n`
    : 'Riset internet tidak tersedia untuk permintaan ini — jangan mengarang klaim spesifik (nama produk/fitur/statistik) yang tidak eksplisit ada di Topik atau Keyword di atas.\n';
  const prompt = `
Anda adalah editor konten DN Tech, perusahaan software Indonesia. Buat satu DRAFT artikel blog yang informatif dan tidak mengarang fakta spesifik tentang DN Tech.

Topik: ${data.topic}
Target pembaca: ${data.audience || 'pemilik bisnis, founder startup, dan tim operasional di Indonesia'}
Gaya bahasa: ${data.tone || 'jelas, hangat, praktis, tidak kaku'}
Keyword yang boleh dipakai secara natural: ${data.keywords || 'software development Indonesia, aplikasi custom, workflow bisnis'}
Bahasa: ${data.language || 'Bahasa Indonesia'}

${researchBlock}
Aturan:
- Fokus pada masalah pembaca dan langkah yang bisa diterapkan.
- Jangan membuat klaim statistik, harga, studi kasus, atau nama klien tanpa sumber dari hasil riset internet di atas atau dari input.
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

export async function generateServiceDraft(input: unknown, _userId: string) {
  const data = generateServiceSchema.parse(input);
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new AppError(503, 'AI_NOT_CONFIGURED', 'GEMINI_API_KEY belum dikonfigurasi di backend');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const prompt = `
Anda adalah copywriter dan product marketer DN Tech, perusahaan software Indonesia. Buat DRAFT halaman layanan berdasarkan brief admin berikut.

Brief layanan dari admin:
${data.prompt}

Target pembaca: ${data.audience || 'pemilik bisnis, founder startup, dan tim operasional di Indonesia'}
Gaya bahasa: ${data.tone || 'jelas, hangat, profesional, praktis'}
Keyword SEO (gunakan natural bila relevan): ${data.keywords || 'jasa software development Indonesia, aplikasi custom, transformasi digital'}

Aturan:
- Ikuti brief admin sebagai sumber utama. Jangan mengarang klien, angka, harga, sertifikasi, integrasi, atau hasil bisnis yang tidak disebutkan di brief.
- Jelaskan nilai layanan secara konkret, bukan jargon kosong.
- Description harus 2-4 paragraf singkat dalam plain text, tanpa HTML atau markdown.
- Buat 3-6 fitur/cakupan layanan yang relevan. Setiap feature memiliki title dan description singkat.
- Kembalikan JSON valid saja, tanpa markdown fence, dengan field: name, slug, description, category, features, seoTitle, seoDescription.
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
  if (!text) throw new AppError(502, 'AI_EMPTY_RESPONSE', 'Gemini tidak mengembalikan draft layanan');
  return generatedServiceSchema.parse(parseJson(text));
}
