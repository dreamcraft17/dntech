import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse } from '../utils/helpers';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    const startedAt = Date.now();
    if (!q || q.length < 2) {
      console.info('[search] ignored short query', { q, ip: req.ip });
      return successResponse(res, []);
    }

    const [services, products, blogPosts, faqs, portfolio] = await Promise.all([
      prisma.service.findMany({
        where: {
          status: 'active',
          deletedAt: null,
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, name: true, slug: true, description: true },
      }),
      prisma.product.findMany({
        where: {
          status: 'active',
          deletedAt: null,
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, name: true, slug: true, description: true },
      }),
      prisma.blogPost.findMany({
        where: {
          status: 'published',
          deletedAt: null,
          OR: [
            { title: { contains: q } },
            { content: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, title: true, slug: true, excerpt: true },
      }),
      prisma.faq.findMany({
        where: {
          isActive: true,
          OR: [
            { question: { contains: q } },
            { answer: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, question: true, answer: true, category: true },
      }),
      prisma.portfolioItem.findMany({
        where: {
          status: 'active',
          deletedAt: null,
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, title: true, slug: true, description: true },
      }),
    ]);

    const results = [
      ...services.map((s) => ({
        type: 'service',
        title: s.name,
        snippet: s.description?.substring(0, 150),
        url: `/services/${s.slug}`,
      })),
      ...products.map((p) => ({
        type: 'product',
        title: p.name,
        snippet: p.description?.substring(0, 150),
        url: `/products/${p.slug}`,
      })),
      ...blogPosts.map((b) => ({
        type: 'blog',
        title: b.title,
        snippet: b.excerpt || '',
        url: `/blog/${b.slug}`,
      })),
      ...portfolio.map((p) => ({
        type: 'portfolio',
        title: p.title,
        snippet: p.description?.substring(0, 150) || '',
        url: `/portfolio/${p.slug}`,
      })),
      ...faqs.map((f) => ({
        type: 'faq',
        title: f.question,
        snippet: f.answer.substring(0, 150),
        url: `/faq#${f.id}`,
      })),
    ];

    console.info('[search] completed', {
      q,
      total: results.length,
      services: services.length,
      products: products.length,
      blogPosts: blogPosts.length,
      portfolio: portfolio.length,
      faqs: faqs.length,
      durationMs: Date.now() - startedAt,
      ip: req.ip,
    });

    successResponse(res, results);
  })
);

export default router;
