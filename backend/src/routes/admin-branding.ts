import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { asyncHandler, successResponse, param } from '../utils/helpers';
import { authenticate, requireRole } from '../middleware/auth';
import { cacheService } from '../services/CacheService';

const router = Router();
router.use(authenticate, requireRole('SuperAdmin', 'ContentManager'));

router.get('/content', asyncHandler(async (_req, res) => {
  const content = await prisma.brandContent.findFirst({ orderBy: { updatedAt: 'desc' } });
  successResponse(res, content);
}));

router.put('/content', asyncHandler(async (req, res) => {
  const payload = z.object({
    tagline: z.string().min(1),
    story: z.string().min(1),
    mission: z.string().min(1),
    imageUrl: z.string().optional().nullable(),
  }).parse(req.body);

  const existing = await prisma.brandContent.findFirst({ orderBy: { updatedAt: 'desc' } });
  const content = existing
    ? await prisma.brandContent.update({ where: { id: existing.id }, data: payload })
    : await prisma.brandContent.create({ data: payload });

  cacheService.clear();
  successResponse(res, content);
}));

const valueSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  iconName: z.string().min(1),
  order: z.number().int().optional(),
});

router.get('/values', asyncHandler(async (_req, res) => {
  const values = await prisma.coreValue.findMany({ orderBy: { order: 'asc' } });
  successResponse(res, values);
}));

router.post('/values', asyncHandler(async (req, res) => {
  const data = valueSchema.parse(req.body);
  const created = await prisma.coreValue.create({ data: { ...data, order: data.order ?? 0 } });
  cacheService.clear();
  successResponse(res, created, 201);
}));

router.put('/values/:id', asyncHandler(async (req, res) => {
  const data = valueSchema.partial().parse(req.body);
  const updated = await prisma.coreValue.update({ where: { id: param(req.params.id) }, data });
  cacheService.clear();
  successResponse(res, updated);
}));
router.patch('/values/:id', asyncHandler(async (req, res) => {
  const data = valueSchema.partial().parse(req.body);
  const updated = await prisma.coreValue.update({ where: { id: param(req.params.id) }, data });
  cacheService.clear();
  successResponse(res, updated);
}));

router.delete('/values/:id', asyncHandler(async (req, res) => {
  await prisma.coreValue.delete({ where: { id: param(req.params.id) } });
  cacheService.clear();
  successResponse(res, { deleted: true });
}));

const advantageSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  iconName: z.string().min(1),
  order: z.number().int().optional(),
});

router.get('/advantages', asyncHandler(async (_req, res) => {
  const items = await prisma.competitiveAdvantage.findMany({ orderBy: { order: 'asc' } });
  successResponse(res, items);
}));

router.post('/advantages', asyncHandler(async (req, res) => {
  const data = advantageSchema.parse(req.body);
  const created = await prisma.competitiveAdvantage.create({ data: { ...data, order: data.order ?? 0 } });
  cacheService.clear();
  successResponse(res, created, 201);
}));

router.put('/advantages/:id', asyncHandler(async (req, res) => {
  const data = advantageSchema.partial().parse(req.body);
  const updated = await prisma.competitiveAdvantage.update({ where: { id: param(req.params.id) }, data });
  cacheService.clear();
  successResponse(res, updated);
}));
router.patch('/advantages/:id', asyncHandler(async (req, res) => {
  const data = advantageSchema.partial().parse(req.body);
  const updated = await prisma.competitiveAdvantage.update({ where: { id: param(req.params.id) }, data });
  cacheService.clear();
  successResponse(res, updated);
}));

router.delete('/advantages/:id', asyncHandler(async (req, res) => {
  await prisma.competitiveAdvantage.delete({ where: { id: param(req.params.id) } });
  cacheService.clear();
  successResponse(res, { deleted: true });
}));

const teamSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});

router.get('/team', asyncHandler(async (_req, res) => {
  const team = await prisma.teamMember.findMany({
    include: { photo: true },
    orderBy: { displayOrder: 'asc' },
  });
  const mapped = team.map((member) => ({
    id: member.id,
    name: member.name,
    role: member.role,
    bio: member.bio || '',
    photoUrl: member.photo?.url || '',
    linkedinUrl: typeof member.socialLinks === 'object' && member.socialLinks && 'linkedin' in member.socialLinks
      ? String((member.socialLinks as Record<string, unknown>).linkedin || '')
      : '',
    twitterUrl: typeof member.socialLinks === 'object' && member.socialLinks && 'twitter' in member.socialLinks
      ? String((member.socialLinks as Record<string, unknown>).twitter || '')
      : '',
    order: member.displayOrder,
    published: member.isActive,
  }));
  successResponse(res, mapped);
}));

router.post('/team', asyncHandler(async (req, res) => {
  const data = teamSchema.parse(req.body);
  const socialLinks = {
    linkedin: data.linkedinUrl || '',
    twitter: data.twitterUrl || '',
    photoUrl: data.photoUrl || '',
  };
  const created = await prisma.teamMember.create({
    data: {
      name: data.name,
      role: data.role,
      bio: data.bio || '',
      socialLinks,
      displayOrder: data.order ?? 0,
      isActive: data.published ?? true,
    },
  });
  cacheService.clear();
  successResponse(res, created, 201);
}));

router.put('/team/:id', asyncHandler(async (req, res) => {
  const data = teamSchema.partial().parse(req.body);
  const existing = await prisma.teamMember.findUnique({ where: { id: param(req.params.id) } });
  const existingSocial = (existing?.socialLinks as Record<string, unknown> | null) || {};
  const socialLinks = {
    ...existingSocial,
    ...(data.linkedinUrl !== undefined ? { linkedin: data.linkedinUrl } : {}),
    ...(data.twitterUrl !== undefined ? { twitter: data.twitterUrl } : {}),
    ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
  };

  const updated = await prisma.teamMember.update({
    where: { id: param(req.params.id) },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
      ...(data.order !== undefined ? { displayOrder: data.order } : {}),
      ...(data.published !== undefined ? { isActive: data.published } : {}),
      socialLinks,
    },
  });
  cacheService.clear();
  successResponse(res, updated);
}));
router.patch('/team/:id', asyncHandler(async (req, res) => {
  const data = teamSchema.partial().parse(req.body);
  const existing = await prisma.teamMember.findUnique({ where: { id: param(req.params.id) } });
  const existingSocial = (existing?.socialLinks as Record<string, unknown> | null) || {};
  const socialLinks = {
    ...existingSocial,
    ...(data.linkedinUrl !== undefined ? { linkedin: data.linkedinUrl } : {}),
    ...(data.twitterUrl !== undefined ? { twitter: data.twitterUrl } : {}),
    ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
  };
  const updated = await prisma.teamMember.update({
    where: { id: param(req.params.id) },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
      ...(data.order !== undefined ? { displayOrder: data.order } : {}),
      ...(data.published !== undefined ? { isActive: data.published } : {}),
      socialLinks,
    },
  });
  cacheService.clear();
  successResponse(res, updated);
}));

router.delete('/team/:id', asyncHandler(async (req, res) => {
  await prisma.teamMember.delete({ where: { id: param(req.params.id) } });
  cacheService.clear();
  successResponse(res, { deleted: true });
}));

const testimonialSchema = z.object({
  quote: z.string().min(1),
  author: z.string().min(1),
  title: z.string().min(1),
  company: z.string().optional(),
  logoUrl: z.string().optional(),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
});

router.get('/testimonials', asyncHandler(async (_req, res) => {
  const items = await prisma.testimonial.findMany({
    include: { photo: true },
    orderBy: { createdAt: 'asc' },
  });
  const mapped = items.map((item, index) => ({
    id: item.id,
    quote: item.quote,
    author: item.clientName,
    title: item.title || item.position || '',
    company: item.company || '',
    logoUrl: item.photo?.url || '',
    published: item.isApproved,
    order: index,
  }));
  successResponse(res, mapped);
}));

router.post('/testimonials', asyncHandler(async (req, res) => {
  const data = testimonialSchema.parse(req.body);
  const created = await prisma.testimonial.create({
    data: {
      quote: data.quote,
      clientName: data.author,
      title: data.title,
      company: data.company || '',
      isApproved: data.published ?? true,
      position: data.title,
    },
  });
  cacheService.clear();
  successResponse(res, created, 201);
}));

router.put('/testimonials/:id', asyncHandler(async (req, res) => {
  const data = testimonialSchema.partial().parse(req.body);
  const updated = await prisma.testimonial.update({
    where: { id: param(req.params.id) },
    data: {
      ...(data.quote !== undefined ? { quote: data.quote } : {}),
      ...(data.author !== undefined ? { clientName: data.author } : {}),
      ...(data.title !== undefined ? { title: data.title, position: data.title } : {}),
      ...(data.company !== undefined ? { company: data.company } : {}),
      ...(data.published !== undefined ? { isApproved: data.published } : {}),
    },
  });
  cacheService.clear();
  successResponse(res, updated);
}));
router.patch('/testimonials/:id', asyncHandler(async (req, res) => {
  const data = testimonialSchema.partial().parse(req.body);
  const updated = await prisma.testimonial.update({
    where: { id: param(req.params.id) },
    data: {
      ...(data.quote !== undefined ? { quote: data.quote } : {}),
      ...(data.author !== undefined ? { clientName: data.author } : {}),
      ...(data.title !== undefined ? { title: data.title, position: data.title } : {}),
      ...(data.company !== undefined ? { company: data.company } : {}),
      ...(data.published !== undefined ? { isApproved: data.published } : {}),
    },
  });
  cacheService.clear();
  successResponse(res, updated);
}));

router.delete('/testimonials/:id', asyncHandler(async (req, res) => {
  await prisma.testimonial.delete({ where: { id: param(req.params.id) } });
  cacheService.clear();
  successResponse(res, { deleted: true });
}));

const statSchema = z.object({
  label: z.string().min(1),
  value: z.number().int(),
  iconName: z.string().min(1),
  order: z.number().int().optional(),
});

router.get('/stats', asyncHandler(async (_req, res) => {
  const stats = await prisma.stat.findMany({ orderBy: { order: 'asc' } });
  successResponse(res, stats);
}));

router.post('/stats', asyncHandler(async (req, res) => {
  const data = statSchema.parse(req.body);
  const created = await prisma.stat.create({ data: { ...data, order: data.order ?? 0 } });
  cacheService.clear();
  successResponse(res, created, 201);
}));

router.put('/stats/:id', asyncHandler(async (req, res) => {
  const data = statSchema.partial().parse(req.body);
  const updated = await prisma.stat.update({ where: { id: param(req.params.id) }, data });
  cacheService.clear();
  successResponse(res, updated);
}));
router.patch('/stats/:id', asyncHandler(async (req, res) => {
  const data = statSchema.partial().parse(req.body);
  const updated = await prisma.stat.update({ where: { id: param(req.params.id) }, data });
  cacheService.clear();
  successResponse(res, updated);
}));

router.delete('/stats/:id', asyncHandler(async (req, res) => {
  await prisma.stat.delete({ where: { id: param(req.params.id) } });
  cacheService.clear();
  successResponse(res, { deleted: true });
}));

export default router;
