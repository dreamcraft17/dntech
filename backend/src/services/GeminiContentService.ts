import { z } from 'zod';
import prisma from '../config/database';
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

type OpenAIResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

type OpenAIImageResponse = {
  data?: Array<{ b64_json?: string; url?: string }>;
  error?: { message?: string };
};

const OPENAI_TIMEOUT_MS = 30_000;
const BRAND_CONTEXT_TIMEOUT_MS = 8_000;
const GEMINI_RESEARCH_TIMEOUT_MS = 45_000;
const MAX_BRAND_CONTEXT_CHARS = 12_000;
export const BLOG_MIN_WORDS = 500;
const BLOG_TARGET_WORD_RANGE = '700-1000';

function openAIKey() {
  return process.env.OPENAI_API_KEY?.trim() || '';
}

function openAIBaseUrl(apiKey: string) {
  const configured = process.env.OPENAI_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  if (apiKey.startsWith('sk-or-v1-')) return 'https://openrouter.ai/api/v1';
  return 'https://api.openai.com/v1';
}

function openAIModel(apiKey: string) {
  return process.env.OPENAI_MODEL?.trim()
    || (openAIBaseUrl(apiKey).includes('openrouter') ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');
}

function extractText(response: GeminiResponse) {
  return response.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim() || '';
}

function extractOpenAIText(response: OpenAIResponse) {
  return response.choices?.[0]?.message?.content?.trim() || '';
}

async function callOpenAIJson(prompt: string, systemInstruction: string, apiKey: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
  const baseUrl = openAIBaseUrl(apiKey);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...(baseUrl.includes('openrouter') ? {
          'HTTP-Referer': process.env.FRONTEND_URL || 'https://dntech.id',
          'X-Title': 'DN Tech Blog Generator',
        } : {}),
      },
      body: JSON.stringify({
        model: openAIModel(apiKey),
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });
    const result = await response.json() as OpenAIResponse;
    if (!response.ok) throw new AppError(502, 'AI_REQUEST_FAILED', result.error?.message || 'Permintaan ke OpenAI gagal');
    const text = extractOpenAIText(result);
    if (!text) throw new AppError(502, 'AI_EMPTY_RESPONSE', 'OpenAI tidak mengembalikan draft');
    return text;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if ((error as Error)?.name === 'AbortError') throw new AppError(504, 'AI_TIMEOUT', 'OpenAI tidak merespons tepat waktu.');
    throw new AppError(502, 'AI_REQUEST_FAILED', 'Permintaan ke OpenAI gagal');
  } finally {
    clearTimeout(timeout);
  }
}

function parseJson(text: string) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(cleaned) as unknown;
  } catch {
    throw new AppError(502, 'AI_INVALID_RESPONSE', 'Provider AI mengembalikan format draft yang tidak valid');
  }
}

function plainTextFromHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchPublicBrandContext(topic: string) {
  const terms = topic.toLowerCase().match(/[a-z0-9À-ÿ]+/gi)?.filter((term) => term.length > 2).slice(0, 6) || [];
  const searchable = terms.length > 0
    ? terms.flatMap((term) => [
      { name: { contains: term, mode: 'insensitive' as const } },
      { description: { contains: term, mode: 'insensitive' as const } },
    ])
    : undefined;

  const [products, services, websiteText] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        showOnHomepage: true,
        ...(searchable ? { OR: searchable } : {}),
      },
      orderBy: { displayOrder: 'asc' },
      take: 5,
      select: { name: true, slug: true, category: true, description: true, tagline: true, features: true },
    }),
    prisma.service.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        ...(searchable ? { OR: searchable } : {}),
      },
      orderBy: { displayOrder: 'asc' },
      take: 5,
      select: { name: true, slug: true, category: true, description: true, features: true },
    }),
    (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), BRAND_CONTEXT_TIMEOUT_MS);
      try {
        const response = await fetch(process.env.PUBLIC_SITE_URL || 'https://dntech.id', { signal: controller.signal });
        return response.ok ? plainTextFromHtml(await response.text()).slice(0, 6_000) : '';
      } catch {
        return '';
      } finally {
        clearTimeout(timeout);
      }
    })(),
  ]);

  const productText = products.map((item) => (
    `- ${item.name} (${item.slug})${item.category ? ` — ${item.category}` : ''}: ${item.tagline || item.description}\n  Fitur: ${JSON.stringify(item.features || [])}`
  )).join('\n');
  const serviceText = services.map((item) => (
    `- ${item.name} (${item.slug})${item.category ? ` — ${item.category}` : ''}: ${item.description}\n  Fitur: ${JSON.stringify(item.features || [])}`
  )).join('\n');

  return [
    'Konteks brand internal DN Tech (referensi editorial, jangan tampilkan sebagai metadata internal):',
    productText ? `Produk DN Tech yang relevan:\n${productText}` : '',
    serviceText ? `Layanan DN Tech yang relevan:\n${serviceText}` : '',
    websiteText ? `Ringkasan halaman publik dntech.id:\n${websiteText}` : '',
  ].filter(Boolean).join('\n\n').slice(0, MAX_BRAND_CONTEXT_CHARS);
}

/**
 * Gemini's `google_search` grounding tool cannot be combined with
 * `responseMimeType: 'application/json'` in the same request (the API
 * rejects structured output alongside tool use). So we run a separate
 * grounded research pass first, then feed its findings as required
 * context into the plain JSON-generation prompt below.
 */
async function researchTopic(topic: string, apiKey: string, model: string) {
  const isDnTechTopic = /\b(dn\s*tech|dntech|dozer(?:\s+napitupulu)?|dn\s*people|dn\s*core|dn\s*shop)\b/i.test(topic);
  const entityResearch = isDnTechTopic && /\b(perusahaan|company|startup|bisnis|founder|pendiri|co-?founder|ceo|chief executive|pemimpin|tokoh|profil|biografi|sejarah|emiten|investor|investasi|akuisisi|merger|karya|karier|career|organization|organisasi)\b/i.test(topic);
  const researchPrompt = `
Cari informasi ${entityResearch ? 'mendalam, komprehensif, dan terkini' : 'terkini dan akurat'} di internet tentang topik berikut, untuk dipakai sebagai bahan artikel blog: "${topic}".

Jika topik menyebut nama produk, perusahaan, atau orang tertentu, cari dan laporkan fakta spesifik tentang mereka (apa yang mereka lakukan, fitur produk, dll) — jangan mengarang jika tidak ketemu, katakan saja informasinya tidak ditemukan.
${entityResearch ? `
Ini adalah riset mendalam khusus DN Tech dan founder-nya. Gunakan beberapa sumber independen dan prioritaskan sumber primer atau kredibel: situs resmi DN Tech, profil perusahaan, siaran pers, wawancara, publikasi industri, registrasi atau filing resmi yang tersedia publik, dan liputan media tepercaya.
Telusuri setidaknya aspek-aspek berikut bila relevan: identitas dan ejaan nama, sejarah dan timeline, pendiri dan peran mereka, kepemilikan atau afiliasi yang terverifikasi, produk/layanan, industri dan lokasi, pendanaan atau akuisisi, jabatan dan karya founder, klaim yang diperdebatkan, serta perubahan terbaru.
Bedakan fakta terverifikasi, klaim dari pihak terkait, dan informasi yang belum dapat dikonfirmasi. Jangan menggabungkan dua entitas yang namanya mirip.
` : ''}
Rangkum temuan dalam poin-poin berbahasa Indonesia, sertakan URL sumber untuk setiap klaim penting dan tanggal publikasi jika tersedia. Jangan mengarang jika tidak ketemu; katakan informasi tidak ditemukan.
`.trim();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_RESEARCH_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        signal: controller.signal,
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
  } finally {
    clearTimeout(timeout);
  }
}

async function generateGeminiBlogImage(title: string, excerpt: string, content: string, apiKey: string, userId: string) {
  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
  const articleContext = plainTextFromHtml(content).slice(0, 2_000);
  const prompt = `
Buat gambar hero editorial rasio 16:9 untuk artikel blog DN Tech.
Judul: ${title}
Ringkasan: ${excerpt}
Konteks isi artikel: ${articleContext}

Gambarkan ide utama dan situasi yang dibahas dalam artikel, bukan sekadar gambar laptop atau orang tersenyum. Gaya: modern, profesional, hangat, bersih, relevan untuk pemilik bisnis dan tim operasional di Indonesia.
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

async function generateOpenAIBlogImage(title: string, excerpt: string, content: string, apiKey: string, userId: string) {
  const articleContext = plainTextFromHtml(content).slice(0, 2_000);
  const response = await fetch(`${openAIBaseUrl(apiKey)}/images/generations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
      size: '1536x864',
      response_format: 'b64_json',
      prompt: `Buat gambar hero editorial rasio 16:9 untuk artikel blog DN Tech. Judul: ${title}. Ringkasan: ${excerpt}. Konteks isi artikel: ${articleContext}. Gambarkan ide utama artikel, bukan stock image generik laptop atau orang tersenyum. Gaya modern, profesional, hangat, bersih, relevan untuk pemilik bisnis dan tim operasional di Indonesia. Jangan gunakan teks, logo, watermark, wajah orang nyata, atau merek pihak lain.`,
    }),
  });
  const result = await response.json() as OpenAIImageResponse;
  if (!response.ok) throw new AppError(502, 'AI_IMAGE_REQUEST_FAILED', result.error?.message || 'OpenAI gagal membuat gambar');
  const image = result.data?.[0];
  if (!image?.b64_json) throw new AppError(502, 'AI_IMAGE_EMPTY_RESPONSE', 'OpenAI tidak mengembalikan gambar base64');

  return createMediaFromBuffer(
    Buffer.from(image.b64_json, 'base64'),
    'image/png',
    `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'blog-cover'}.png`,
    userId,
  );
}

async function generateBlogImage(title: string, excerpt: string, content: string, userId: string) {
  const openAI = openAIKey();
  const gemini = process.env.GEMINI_API_KEY?.trim() || '';

  if (openAI) {
    try {
      return { media: await generateOpenAIBlogImage(title, excerpt, content, openAI, userId), provider: 'openai' as const };
    } catch (error) {
      console.warn('[blog-ai] OpenAI image generation failed; trying Gemini fallback', error instanceof Error ? error.message : error);
    }
  }
  if (gemini) return { media: await generateGeminiBlogImage(title, excerpt, content, gemini, userId), provider: 'gemini' as const };
  throw new AppError(503, 'AI_IMAGE_NOT_CONFIGURED', 'Tidak ada provider image AI yang dikonfigurasi');
}

export async function generateBlogDraft(input: unknown, userId: string) {
  const data = generateBlogSchema.parse(input);
  const openAI = openAIKey();
  const gemini = process.env.GEMINI_API_KEY?.trim() || '';
  if (!openAI && !gemini) throw new AppError(503, 'AI_NOT_CONFIGURED', 'OPENAI_API_KEY atau GEMINI_API_KEY belum dikonfigurasi di backend');

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const [research, brandContext] = await Promise.all([
    gemini ? researchTopic(data.topic, gemini, model) : Promise.resolve(''),
    fetchPublicBrandContext(data.topic).catch(() => ''),
  ]);
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
${brandContext}

Aturan positioning DN Tech:
- Jika topik berkaitan dengan kebutuhan yang dapat ditangani produk atau layanan DN Tech di atas, prioritaskan solusi DN Tech secara natural dan relevan.
- Jangan mempromosikan, merekomendasikan, atau menyisipkan merek kompetitor jika tidak diminta secara eksplisit.
- Jika artikel memang meminta perbandingan kompetitor, tetap faktual, berimbang, dan jangan membuat klaim yang tidak ada di sumber.
- Jangan mengklaim DN Tech memiliki fitur, produk, integrasi, atau hasil yang tidak tercantum dalam konteks brand di atas.
- Hindari hard sell; artikel tetap harus berguna bagi pembaca dan CTA ke DN Tech hanya bila relevan.

Aturan:
- Fokus pada masalah pembaca dan langkah yang bisa diterapkan.
- Jangan membuat klaim statistik, harga, studi kasus, atau nama klien tanpa sumber dari hasil riset internet di atas atau dari input.
- Gunakan HTML sederhana yang aman: <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>, dan <a href="...">.
- Jangan memakai markdown, script, style, iframe, atau atribut HTML selain href pada link.
- Struktur wajib: mulai dengan satu paragraf pembuka, gunakan <h2> untuk setiap bagian utama, <h3> untuk subbagian, dan gunakan list bila membahas langkah atau beberapa poin.
- Jangan menulis judul bagian sebagai paragraf biasa. Jangan memakai <strong> sebagai pengganti heading.
- Jangan mengulang excerpt di paragraf pembuka.
- Panjang artikel wajib minimal ${BLOG_MIN_WORDS} kata. Targetkan ${BLOG_TARGET_WORD_RANGE} kata agar hasil tidak terlalu pendek atau melebar.
- Hitung kata pada field content saja (teks di dalam HTML), bukan title, excerpt, tags, atau metadata. Jangan mengakhiri artikel sebelum batas minimal terpenuhi.
- Kembalikan JSON valid saja, tanpa markdown fence, dengan field: title, slug, excerpt, content, category, tags, seoTitle, seoDescription.
- slug harus lowercase, singkat, dan memakai tanda hubung.
- seoTitle maksimal 60 karakter; seoDescription sekitar 140-160 karakter.
`.trim();

  const systemInstruction = 'Anda adalah editor konten DN Tech. Ikuti format JSON dan aturan editorial yang diberikan pengguna secara ketat.';
  let draft: z.infer<typeof generatedBlogSchema>;
  let contentProvider: 'openai' | 'gemini';

  if (openAI) {
    try {
      draft = generatedBlogSchema.parse(parseJson(await callOpenAIJson(prompt, systemInstruction, openAI)));
      contentProvider = 'openai';
    } catch (error) {
      if (!gemini) throw error;
      console.warn('[blog-ai] OpenAI generation failed; trying Gemini fallback', error instanceof Error ? error.message : error);
      draft = generatedBlogSchema.parse(await generateGeminiBlogDraft(prompt, gemini, model));
      contentProvider = 'gemini';
    }
  } else {
    draft = generatedBlogSchema.parse(await generateGeminiBlogDraft(prompt, gemini, model));
    contentProvider = 'gemini';
  }

  let featuredImage = null;
  let imageProvider: 'openai' | 'gemini' | null = null;
  if (data.generateImage) {
    try {
      const generatedImage = await generateBlogImage(draft.title, draft.excerpt, draft.content, userId);
      featuredImage = generatedImage.media;
      imageProvider = generatedImage.provider;
    } catch (error) {
      // A cover image is optional; keep a valid article draft when image generation is unavailable.
      console.warn('[blog-ai] Cover image generation skipped', error instanceof Error ? error.message : error);
    }
  }

  return {
    ...draft,
    featuredImageId: featuredImage?.id || '',
    featuredImageUrl: featuredImage?.url || '',
    aiProvider: contentProvider,
    imageProvider,
  };
}

async function generateGeminiBlogDraft(prompt: string, apiKey: string, model: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
      }),
    },
  );
  const result = await response.json() as GeminiResponse;
  if (!response.ok) throw new AppError(502, 'AI_REQUEST_FAILED', result.error?.message || 'Permintaan ke Gemini gagal');
  const text = extractText(result);
  if (!text) throw new AppError(502, 'AI_EMPTY_RESPONSE', 'Gemini tidak mengembalikan draft');
  return parseJson(text);
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
