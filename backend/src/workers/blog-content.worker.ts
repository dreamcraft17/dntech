import 'dotenv/config';
import { UserRole } from '@prisma/client';
import prisma from '../config/database';
import logger from '../config/logger';
import { BLOG_MIN_WORDS, generateBlogDraft } from '../services/GeminiContentService';
import { cacheService } from '../services/CacheService';
import { slugify } from '../utils/helpers';

type GeneratedDraft = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category?: string;
  tags?: string[];
  seoTitle: string;
  seoDescription: string;
};

type WorkerResult = {
  created: boolean;
  published: boolean;
  reason?: string;
  postId?: string;
  title?: string;
};

const DEFAULT_SLOTS = ['09:00', '12:00', '15:00', '18:00'];
const DEFAULT_TIMEZONE = 'Asia/Jakarta';
const AUTOMATION_TAG = 'dntech-automation';
const DEFAULT_GENERATION_ATTEMPTS = 3;

const TOPIC_POOL = [
  {
    pillar: 'Product engineering',
    topic: 'Cara menentukan scope MVP agar fitur penting selesai lebih cepat tanpa mengorbankan fondasi teknis',
    keywords: 'scope MVP, product engineering, aplikasi custom Indonesia',
  },
  {
    pillar: 'Workflow bisnis',
    topic: 'Tanda workflow bisnis mulai membutuhkan software dan bukan sekadar spreadsheet tambahan',
    keywords: 'workflow bisnis, software operasional, digitalisasi bisnis Indonesia',
  },
  {
    pillar: 'Produk DN Tech',
    topic: 'Apa yang perlu disiapkan bisnis multi-cabang sebelum memilih software HRIS dan payroll',
    keywords: 'software HRIS Indonesia, payroll multi-cabang, dnPeople',
  },
  {
    pillar: 'Integrasi sistem',
    topic: 'Checklist kesiapan integrasi API untuk bisnis yang masih memakai beberapa sistem terpisah',
    keywords: 'integrasi API, integrasi sistem bisnis, modernisasi sistem legacy',
  },
  {
    pillar: 'Engineering practice',
    topic: 'Mengapa proyek aplikasi terlambat: cara memeriksa scope, dependency, dan definisi selesai sejak awal',
    keywords: 'proyek aplikasi, software development Indonesia, manajemen scope',
  },
  {
    pillar: 'Produk DN Tech',
    topic: 'HRIS untuk bisnis retail dan F&B multi-outlet: data apa yang perlu konsisten antar-cabang',
    keywords: 'HRIS retail, HRIS F&B, software multi-cabang, dnPeople',
  },
  {
    pillar: 'Workflow bisnis',
    topic: 'Cara memetakan approval manual sebelum membangun sistem internal',
    keywords: 'approval workflow, sistem internal, otomasi proses bisnis',
  },
  {
    pillar: 'Product engineering',
    topic: 'Build vs buy untuk workflow bisnis: lima pertanyaan sebelum memutuskan',
    keywords: 'build vs buy, software bisnis, aplikasi custom',
  },
  {
    pillar: 'Engineering practice',
    topic: 'Apa yang seharusnya ada dalam proposal software development yang bisa dipertanggungjawabkan',
    keywords: 'proposal software development, scope project, timeline aplikasi',
  },
  {
    pillar: 'Integrasi sistem',
    topic: 'Kapan modernisasi sistem legacy perlu dilakukan bertahap dan bukan sekaligus',
    keywords: 'modernisasi legacy, integrasi sistem, migrasi software',
  },
  {
    pillar: 'Produk DN Tech',
    topic: 'ERP untuk SME Indonesia: modul mana yang perlu diprioritaskan lebih dulu',
    keywords: 'ERP Indonesia, ERP SME, software operasional, dnCore',
  },
  {
    pillar: 'Engineering practice',
    topic: 'QA aplikasi bukan hanya mencari bug: checklist sebelum software dipakai tim sehari-hari',
    keywords: 'QA aplikasi, testing software, quality assurance Indonesia',
  },
];

function getSlots() {
  const slots = (process.env.BLOG_AUTOMATION_SLOTS || DEFAULT_SLOTS.join(','))
    .split(',')
    .map((slot) => slot.trim())
    .filter((slot) => /^([01]\d|2[0-3]):[0-5]\d$/.test(slot))
    .sort((left, right) => slotMinutes(left) - slotMinutes(right));
  return slots.length > 0 ? slots : DEFAULT_SLOTS;
}

function timezoneParts(date: Date, timeZone = process.env.BLOG_AUTOMATION_TIMEZONE || DEFAULT_TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    dateKey: `${values.year}-${values.month}-${values.day}`,
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}

function slotMinutes(slot: string) {
  const [hour, minute] = slot.split(':').map(Number);
  return hour * 60 + minute;
}

function slotDate(dateKey: string, slot: string, timeZone = process.env.BLOG_AUTOMATION_TIMEZONE || DEFAULT_TIMEZONE) {
  // DN Tech's default timezone is UTC+7. For another timezone, scheduling still
  // remains safe because the publish pass checks the real current timestamp.
  if (timeZone === 'Asia/Jakarta') {
    const [year, month, day] = dateKey.split('-').map(Number);
    const [hour, minute] = slot.split(':').map(Number);
    return new Date(Date.UTC(year, month - 1, day, hour - 7, minute));
  }
  return new Date(`${dateKey}T${slot}:00Z`);
}

function localDayIndex(dateKey: string) {
  return Number(dateKey.replace(/-/g, '')) % TOPIC_POOL.length;
}

export function topicForSlot(dateKey: string, slotIndex: number) {
  return TOPIC_POOL[(localDayIndex(dateKey) + slotIndex) % TOPIC_POOL.length];
}

function plainText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export function validateGeneratedDraft(draft: GeneratedDraft) {
  const text = plainText(draft.content);
  const words = text.split(/\s+/).filter(Boolean).length;
  const forbidden = /\b(as an ai|sebagai model bahasa|saya (adalah|merupakan) ai|lorem ipsum|undefined|null)\b/i.test(text);
  const hasStructure = /<h2\b/i.test(draft.content) && /<p\b/i.test(draft.content);

  return {
    valid: Boolean(
      draft.title.trim() &&
      draft.slug.trim() &&
      draft.excerpt.trim() &&
      draft.seoTitle.trim() &&
      draft.seoDescription.trim() &&
      words >= BLOG_MIN_WORDS &&
      words <= 1800 &&
      hasStructure &&
      !forbidden,
    ),
    words,
    reason: forbidden
      ? 'draft_contains_forbidden_ai_or_placeholder_phrase'
      : !hasStructure
        ? 'draft_missing_html_structure'
        : words < BLOG_MIN_WORDS
          ? 'draft_too_short'
          : words > 1800
            ? 'draft_too_long'
            : undefined,
  };
}

async function findAuthorId() {
  const preferredEmail = process.env.BLOG_AUTOMATION_AUTHOR_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim();
  const preferred = preferredEmail
    ? await prisma.user.findFirst({ where: { email: preferredEmail, isActive: true, deletedAt: null }, select: { id: true } })
    : null;
  if (preferred) return preferred.id;

  const fallback = await prisma.user.findFirst({
    where: { isActive: true, deletedAt: null, role: { in: [UserRole.SuperAdmin, UserRole.ContentManager] } },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  return fallback?.id || null;
}

async function publishDueScheduledPosts(now: Date) {
  const due = await prisma.blogPost.findMany({
    where: { status: 'scheduled', scheduledAt: { lte: now }, deletedAt: null },
    select: { id: true, title: true },
    take: 10,
  });
  if (due.length === 0) return 0;

  await prisma.blogPost.updateMany({
    where: { id: { in: due.map((post) => post.id) }, status: 'scheduled' },
    data: { status: 'published', publishedAt: now },
  });
  cacheService.clear();
  logger.info({ count: due.length }, '[blog-worker] scheduled posts published');
  return due.length;
}

async function generatedToday(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, day, 0, 0));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const recent = await prisma.blogPost.findMany({
    where: { createdAt: { gte: start, lt: end }, deletedAt: null },
    select: { id: true, title: true, slug: true, tags: true },
  });
  return recent.filter((post) => Array.isArray(post.tags) && post.tags.includes(AUTOMATION_TAG));
}

async function skippedTopicsForDay(dateKey: string) {
  const state = await prisma.blogAutomationState.findUnique({
    where: { dateKey },
    select: { skippedTopics: true },
  });
  return Array.isArray(state?.skippedTopics)
    ? state.skippedTopics.filter((topic): topic is string => typeof topic === 'string')
    : [];
}

async function skipTopicForDay(dateKey: string, topic: string) {
  const skippedTopics = await skippedTopicsForDay(dateKey);
  if (skippedTopics.includes(topic)) return;

  await prisma.blogAutomationState.upsert({
    where: { dateKey },
    update: { skippedTopics: [...skippedTopics, topic] },
    create: { dateKey, skippedTopics: [...skippedTopics, topic] },
  });
}

export async function runBlogAutomationOnce(now = new Date()): Promise<WorkerResult> {
  if (process.env.BLOG_AUTOMATION_ENABLED !== 'true') {
    return { created: false, published: false, reason: 'disabled' };
  }

  await publishDueScheduledPosts(now);
  const slots = getSlots();
  const local = timezoneParts(now);
  const currentMinutes = local.hour * 60 + local.minute;
  const dueSlotIndex = slots.findIndex((slot) => slotMinutes(slot) <= currentMinutes);
  if (dueSlotIndex < 0) return { created: false, published: false, reason: 'before_first_slot' };

  const postsToday = await generatedToday(local.dateKey);
  const target = Math.min(Number(process.env.BLOG_AUTOMATION_POSTS_PER_DAY || 4), slots.length);
  if (postsToday.length >= target) return { created: false, published: false, reason: 'daily_target_reached' };
  const skippedTopics = process.env.BLOG_AUTOMATION_DRY_RUN === 'true'
    ? []
    : await skippedTopicsForDay(local.dateKey);
  const topic = topicForSlot(local.dateKey, postsToday.length + skippedTopics.length);

  const authorId = await findAuthorId();
  if (!authorId) throw new Error('No active admin author found for blog automation');

  const maxAttempts = Math.max(1, Number(process.env.BLOG_AUTOMATION_MAX_GENERATION_ATTEMPTS || DEFAULT_GENERATION_ATTEMPTS));
  let draft: GeneratedDraft | null = null;
  let quality: ReturnType<typeof validateGeneratedDraft> | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    draft = await generateBlogDraft({
      topic: topic.topic,
      audience: 'pemilik bisnis, founder startup, HR manager, dan tim operasional di Indonesia',
      tone: 'jelas, hangat, praktis, jujur, tidak terasa seperti copy AI; target 700-1000 kata',
      keywords: topic.keywords,
      language: 'Bahasa Indonesia',
      generateImage: process.env.BLOG_AUTOMATION_DRY_RUN !== 'true'
        && process.env.BLOG_AUTOMATION_GENERATE_IMAGE !== 'false',
      imageProvider: 'gemini',
    }, authorId);
    quality = validateGeneratedDraft(draft);
    if (quality.valid) break;

    logger.warn({ attempt, maxAttempts, title: draft.title, words: quality.words, reason: quality.reason }, '[blog-worker] draft rejected by quality guard');
  }
  if (!draft || !quality || !quality.valid) {
    if (process.env.BLOG_AUTOMATION_DRY_RUN !== 'true') {
      await skipTopicForDay(local.dateKey, topic.topic);
      logger.warn({ topic: topic.topic, dateKey: local.dateKey }, '[blog-worker] topic skipped after max generation attempts');
    }
    return { created: false, published: false, reason: 'topic_skipped_after_max_attempts' };
  }

  const dayTag = `automation:${local.dateKey}`;
  const slotTag = `automation-slot:${postsToday.length}`;
  const topicTag = `automation-topic:${slugify(topic.topic)}`;
  const cleanSlug = slugify(draft.slug || draft.title);
  const duplicate = await prisma.blogPost.findFirst({
    where: { OR: [{ slug: cleanSlug }, { title: draft.title }], deletedAt: null },
    select: { id: true },
  });
  if (duplicate) return { created: false, published: false, reason: 'duplicate_title_or_slug' };

  if (process.env.BLOG_AUTOMATION_DRY_RUN === 'true') {
    logger.info({ title: draft.title, words: quality.words, slot: slots[postsToday.length] }, '[blog-worker] dry run draft accepted');
    return { created: false, published: false, reason: 'dry_run', title: draft.title };
  }

  const publishMode = process.env.BLOG_AUTOMATION_PUBLISH_MODE || 'scheduled';
  const scheduledAt = slotDate(local.dateKey, slots[postsToday.length]);
  // If the worker was briefly offline and catches up after a slot, publish the
  // missed slot immediately instead of creating a scheduled post in the past.
  const isPublished = publishMode === 'published' || scheduledAt <= now;
  const post = await prisma.blogPost.create({
    data: {
      title: draft.title,
      slug: cleanSlug,
      content: draft.content,
      excerpt: draft.excerpt,
      category: draft.category || topic.pillar,
      tags: [...(draft.tags || []), AUTOMATION_TAG, dayTag, slotTag, topicTag, topic.pillar.toLowerCase().replace(/\s+/g, '-')],
      authorId,
      status: isPublished ? 'published' : 'scheduled',
      publishedAt: isPublished ? now : undefined,
      scheduledAt: isPublished ? undefined : scheduledAt,
      seoTitle: draft.seoTitle,
      seoDescription: draft.seoDescription,
    },
    select: { id: true, title: true },
  });
  cacheService.clear();
  logger.info({ postId: post.id, title: post.title, status: isPublished ? 'published' : 'scheduled' }, '[blog-worker] blog post created');
  return { created: true, published: isPublished, postId: post.id, title: post.title };
}

export function startBlogContentWorker() {
  const intervalMs = Math.max(60_000, Number(process.env.BLOG_AUTOMATION_INTERVAL_MS || 900_000));
  logger.info({ intervalMs }, '[blog-worker] started');
  let running = false;
  const tick = () => runBlogAutomationOnce().catch((error) => logger.error({ err: error }, '[blog-worker] run failed'));
  const guardedTick = () => {
    if (running) return;
    running = true;
    void tick().finally(() => { running = false; });
  };
  guardedTick();
  return setInterval(guardedTick, intervalMs);
}

if (require.main === module) {
  startBlogContentWorker();
}
