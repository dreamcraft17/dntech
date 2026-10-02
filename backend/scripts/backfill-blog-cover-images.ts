/**
 * Backfill cover images for blog posts yang kena bug featuredImageId tidak
 * tersimpan oleh blog-content.worker.ts (lihat fix di commit terkait).
 *
 * Mencari semua BlogPost dengan tag "dntech-automation" dan featuredImageId
 * kosong, generate cover image baru (OpenAI, fallback Gemini — sama seperti
 * worker), lalu simpan featuredImageId ke post tersebut.
 *
 * Usage:
 *   npx tsx scripts/backfill-blog-cover-images.ts            # jalankan beneran
 *   npx tsx scripts/backfill-blog-cover-images.ts --dry-run  # cuma list, tanpa generate/simpan
 *   npx tsx scripts/backfill-blog-cover-images.ts --limit 5  # batasi jumlah post yang diproses
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { generateBlogCoverImage } from '../src/services/GeminiContentService';

const prisma = new PrismaClient();

const AUTOMATION_TAG = 'dntech-automation';
const DELAY_BETWEEN_POSTS_MS = 2_000;

function parseArgs(argv: string[]) {
  const dryRun = argv.includes('--dry-run');
  const limitFlagIndex = argv.indexOf('--limit');
  const limit = limitFlagIndex >= 0 ? Number(argv[limitFlagIndex + 1]) : undefined;
  return { dryRun, limit: Number.isFinite(limit) && limit! > 0 ? limit : undefined };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { dryRun, limit } = parseArgs(process.argv.slice(2));

  const candidates = await prisma.blogPost.findMany({
    where: { featuredImageId: null, deletedAt: null },
    select: { id: true, title: true, excerpt: true, content: true, tags: true, authorId: true, status: true },
    orderBy: { createdAt: 'asc' },
  });

  const automationPosts = candidates.filter(
    (post) => Array.isArray(post.tags) && post.tags.includes(AUTOMATION_TAG),
  );
  const toProcess = limit ? automationPosts.slice(0, limit) : automationPosts;

  console.log(`Ditemukan ${automationPosts.length} post automation tanpa cover image.`);
  if (limit) console.log(`Diproses: ${toProcess.length} (dibatasi --limit ${limit}).`);
  if (dryRun) {
    toProcess.forEach((post) => console.log(`[dry-run] akan diproses: ${post.id} — ${post.title}`));
    await prisma.$disconnect();
    return;
  }

  let success = 0;
  let failed = 0;

  for (const post of toProcess) {
    try {
      const authorId = post.authorId;
      if (!authorId) {
        console.warn(`[skip] ${post.id} — ${post.title}: tidak ada authorId, tidak bisa attribute media`);
        failed += 1;
        continue;
      }

      const generated = await generateBlogCoverImage(
        { title: post.title, excerpt: post.excerpt || '', content: post.content },
        authorId,
      );

      await prisma.blogPost.update({
        where: { id: post.id },
        data: { featuredImageId: generated.featuredImageId },
      });

      console.log(`[ok] ${post.id} — ${post.title} (provider: ${generated.imageProvider})`);
      success += 1;
    } catch (error) {
      console.error(`[gagal] ${post.id} — ${post.title}:`, error instanceof Error ? error.message : error);
      failed += 1;
    }

    await sleep(DELAY_BETWEEN_POSTS_MS);
  }

  console.log(`\nSelesai. Berhasil: ${success}, gagal: ${failed}, total diproses: ${toProcess.length}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
