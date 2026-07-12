import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { asyncHandler, successResponse, paginatedResponse, getPagination, slugify, AppError, param } from '../utils/helpers';
import {
  authenticate,
  requireRole,
  requireWrite,
  AuthRequest,
  logActivity,
} from '../middleware/auth';
import { hashPassword, validatePassword } from '../utils/auth';
import { cacheService } from '../services/CacheService';
import { emailQueueService } from '../services/EmailQueueService';

const router = Router();
router.use(authenticate);

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  },
});

// --- Services ---
const serviceSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().optional(),
  description: z.string().min(10),
  features: z.array(z.object({ title: z.string(), description: z.string().optional() })).optional(),
  iconUrl: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  displayOrder: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

router.get('/services', asyncHandler(async (req, res) => {
  const { status, category, search } = req.query;
  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.status = String(status);
  if (category) where.category = String(category);
  if (search) where.name = { contains: String(search) };

  const services = await prisma.service.findMany({ where, orderBy: { displayOrder: 'asc' } });
  successResponse(res, services);
}));

router.post('/services', requireWrite('services'), asyncHandler(async (req: AuthRequest, res) => {
  const data = serviceSchema.parse(req.body);
  const slug = data.slug || slugify(data.name);

  const service = await prisma.service.create({
    data: { ...data, slug, createdById: req.user!.id },
  });
  await logActivity(req.user!.id, 'create', 'service', service.id, data, req.ip);
  cacheService.clear();
  successResponse(res, service, 201);
}));

router.patch('/services/:id', requireWrite('services'), asyncHandler(async (req: AuthRequest, res) => {
  const data = serviceSchema.partial().parse(req.body);
  const service = await prisma.service.update({ where: { id: param(req.params.id) }, data });
  await logActivity(req.user!.id, 'update', 'service', service.id, data, req.ip);
  cacheService.clear();
  successResponse(res, service);
}));

router.delete('/services/:id', requireWrite('services'), asyncHandler(async (req: AuthRequest, res) => {
  await prisma.service.update({
    where: { id: param(req.params.id) },
    data: { deletedAt: new Date(), status: 'archived' },
  });
  await logActivity(req.user!.id, 'delete', 'service', param(req.params.id), undefined, req.ip);
  cacheService.clear();
  successResponse(res, { deleted: true });
}));

router.post('/services/reorder', requireWrite('services'), asyncHandler(async (req, res) => {
  const { ids } = z.object({ ids: z.array(z.string()) }).parse(req.body);
  await Promise.all(ids.map((id, index) =>
    prisma.service.update({ where: { id }, data: { displayOrder: index } })
  ));
  cacheService.clear();
  successResponse(res, { reordered: true });
}));

// --- Products ---
const productSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().optional(),
  description: z.string().min(10),
  features: z.any().optional(),
  iconUrl: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  displayOrder: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),

  tagline: z.string().optional(),
  heroImage: z.string().optional(),
  heroAlt: z.string().optional(),
  logoUrl: z.string().optional(),
  screenshotUrls: z.any().optional(),
  keywords: z.string().optional(),
  canonical: z.string().optional(),
  featured: z.boolean().optional(),
  publishedAt: z.string().optional(),
  launchStatus: z.enum(['launched', 'beta', 'coming_soon']).optional(),
  freemiumEnabled: z.boolean().optional(),
  freeLimit: z.string().optional(),
  trialDays: z.number().optional(),
  customerCount: z.string().optional(),
  techStack: z.any().optional(),
  pricingTiers: z.any().optional(),
  integrations: z.any().optional(),
  useCases: z.any().optional(),
  testimonials: z.any().optional(),
  caseStudies: z.any().optional(),
  comparisonTable: z.any().optional(),
  roadmap: z.any().optional(),
  primaryCta: z.any().optional(),
  secondaryCtas: z.any().optional(),
  pricingCalcUrl: z.string().optional(),
  demoUrl: z.string().optional(),
  longFormContent: z.string().optional(),
  faq: z.any().optional(),
});

router.get('/products', asyncHandler(async (req, res) => {
  const { status, category, search } = req.query;
  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.status = String(status);
  if (category) where.category = String(category);
  if (search) where.name = { contains: String(search) };

  const products = await prisma.product.findMany({ where, orderBy: { displayOrder: 'asc' } });
  successResponse(res, products);
}));

router.post('/products', requireWrite('products'), asyncHandler(async (req: AuthRequest, res) => {
  const data = productSchema.parse(req.body);
  const slug = data.slug || slugify(data.name);

  const product = await prisma.product.create({
    data: { ...data, slug, publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined, createdById: req.user!.id },
  });
  await logActivity(req.user!.id, 'create', 'product', product.id, data, req.ip);
  cacheService.clear();
  successResponse(res, product, 201);
}));

router.patch('/products/:id', requireWrite('products'), asyncHandler(async (req: AuthRequest, res) => {
  const data = productSchema.partial().parse(req.body);
  const product = await prisma.product.update({
    where: { id: param(req.params.id) },
    data: { ...data, publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined },
  });
  await logActivity(req.user!.id, 'update', 'product', product.id, data, req.ip);
  cacheService.clear();
  successResponse(res, product);
}));

router.delete('/products/:id', requireWrite('products'), asyncHandler(async (req: AuthRequest, res) => {
  await prisma.product.update({
    where: { id: param(req.params.id) },
    data: { deletedAt: new Date(), status: 'archived' },
  });
  await logActivity(req.user!.id, 'delete', 'product', param(req.params.id), undefined, req.ip);
  cacheService.clear();
  successResponse(res, { deleted: true });
}));

router.post('/products/reorder', requireWrite('products'), asyncHandler(async (req, res) => {
  const { ids } = z.object({ ids: z.array(z.string()) }).parse(req.body);
  await Promise.all(ids.map((id, index) =>
    prisma.product.update({ where: { id }, data: { displayOrder: index } })
  ));
  cacheService.clear();
  successResponse(res, { reordered: true });
}));

// --- Portfolio ---
const portfolioSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  clientName: z.string().optional(),
  industries: z.array(z.string()).optional(),
  serviceIds: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().optional(),
  outcomes: z.string().optional(),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  metrics: z.record(z.string()).optional(),
  clientLogoUrl: z.string().optional(),
  testimonial: z.string().optional(),
  featuredImageId: z.string().optional(),
  imageIds: z.array(z.string()).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  displayOrder: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

router.get('/portfolio', asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.status = String(status);
  if (search) where.title = { contains: String(search) };

  const items = await prisma.portfolioItem.findMany({
    where,
    orderBy: { displayOrder: 'asc' },
    include: { featuredImage: true },
  });
  successResponse(res, items);
}));

router.post('/portfolio', requireWrite('portfolio'), asyncHandler(async (req: AuthRequest, res) => {
  const data = portfolioSchema.parse(req.body);
  const slug = data.slug || slugify(data.title);
  const item = await prisma.portfolioItem.create({
    data: {
      ...data,
      slug,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      createdById: req.user!.id,
    },
    include: { featuredImage: true },
  });
  await logActivity(req.user!.id, 'create', 'portfolio', item.id, data, req.ip);
  successResponse(res, item, 201);
}));

router.patch('/portfolio/:id', requireWrite('portfolio'), asyncHandler(async (req: AuthRequest, res) => {
  const data = portfolioSchema.partial().parse(req.body);
  const item = await prisma.portfolioItem.update({
    where: { id: param(req.params.id) },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
    include: { featuredImage: true },
  });
  await logActivity(req.user!.id, 'update', 'portfolio', item.id, data, req.ip);
  successResponse(res, item);
}));

router.delete('/portfolio/:id', requireWrite('portfolio'), asyncHandler(async (req: AuthRequest, res) => {
  await prisma.portfolioItem.update({
    where: { id: param(req.params.id) },
    data: { deletedAt: new Date() },
  });
  successResponse(res, { deleted: true });
}));

// --- Blog ---
const blogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  content: z.string().min(100),
  excerpt: z.string().optional(),
  featuredImageId: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'scheduled']).optional(),
  publishedAt: z.string().optional(),
  scheduledAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

router.get('/blog', asyncHandler(async (req, res) => {
  const { status, category, search } = req.query;
  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.status = String(status);
  if (category) where.category = String(category);
  if (search) where.title = { contains: String(search) };

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { featuredImage: true, author: { select: { name: true } } },
  });
  successResponse(res, posts);
}));

router.post('/blog', requireWrite('blog'), asyncHandler(async (req: AuthRequest, res) => {
  const data = blogSchema.parse(req.body);
  const slug = data.slug || slugify(data.title);
  const post = await prisma.blogPost.create({
    data: {
      ...data,
      slug,
      authorId: req.user!.id,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    },
    include: { featuredImage: true },
  });
  await logActivity(req.user!.id, 'create', 'blog', post.id, data, req.ip);
  cacheService.clear();
  successResponse(res, post, 201);
}));

router.patch('/blog/:id', requireWrite('blog'), asyncHandler(async (req: AuthRequest, res) => {
  const data = blogSchema.partial().parse(req.body);
  const post = await prisma.blogPost.update({
    where: { id: param(req.params.id) },
    data: {
      ...data,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    },
    include: { featuredImage: true },
  });
  cacheService.clear();
  successResponse(res, post);
}));

router.post('/blog/:id/publish', requireWrite('blog'), asyncHandler(async (req, res) => {
  const post = await prisma.blogPost.update({
    where: { id: param(req.params.id) },
    data: { status: 'published', publishedAt: new Date() },
  });
  cacheService.clear();
  successResponse(res, post);
}));

router.delete('/blog/:id', requireWrite('blog'), asyncHandler(async (req, res) => {
  await prisma.blogPost.update({ where: { id: param(req.params.id) }, data: { deletedAt: new Date() } });
  cacheService.clear();
  successResponse(res, { deleted: true });
}));

// --- Leads ---
router.get('/leads', asyncHandler(async (req, res) => {
  const { status, formType, search } = req.query;
  const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>);
  const where: Record<string, unknown> = {};
  if (status) where.status = String(status);
  if (formType) where.formType = String(formType);
  if (search) {
    where.OR = [
      { name: { contains: String(search) } },
      { email: { contains: String(search) } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.formSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: { assignedTo: { select: { id: true, name: true } } },
    }),
    prisma.formSubmission.count({ where }),
  ]);

  paginatedResponse(res, leads, { page, pageSize, total });
}));

router.get('/leads/:id', asyncHandler(async (req, res) => {
  const lead = await prisma.formSubmission.findUnique({
    where: { id: param(req.params.id) },
    include: { assignedTo: { select: { id: true, name: true, email: true } } },
  });
  if (!lead) throw new AppError(404, 'NOT_FOUND', 'Lead not found');
  await prisma.formSubmission.update({ where: { id: lead.id }, data: { isRead: true } });
  successResponse(res, lead);
}));

router.patch('/leads/:id/status', requireWrite('leads'), asyncHandler(async (req, res) => {
  const { status } = z.object({
    status: z.enum(['new', 'contacted', 'qualified', 'converted', 'rejected']),
  }).parse(req.body);
  const lead = await prisma.formSubmission.update({
    where: { id: param(req.params.id) },
    data: { status },
  });
  successResponse(res, lead);
}));

router.patch('/leads/:id/assign', requireWrite('leads'), asyncHandler(async (req, res) => {
  const { assignedToId } = z.object({ assignedToId: z.string() }).parse(req.body);
  const lead = await prisma.formSubmission.update({
    where: { id: param(req.params.id) },
    data: { assignedToId },
    include: { assignedTo: { select: { name: true, email: true } } },
  });
  successResponse(res, lead);
}));

router.post('/leads/:id/notes', requireWrite('leads'), asyncHandler(async (req, res) => {
  const { note } = z.object({ note: z.string().min(1) }).parse(req.body);
  const existing = await prisma.formSubmission.findUnique({ where: { id: param(req.params.id) } });
  const notes = existing?.notes ? `${existing.notes}\n\n[${new Date().toISOString()}] ${note}` : note;
  const lead = await prisma.formSubmission.update({
    where: { id: param(req.params.id) },
    data: { notes },
  });
  successResponse(res, lead);
}));

router.post('/leads/export', asyncHandler(async (req, res) => {
  const { status, formType } = req.body || {};
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (formType) where.formType = formType;

  const leads = await prisma.formSubmission.findMany({ where, orderBy: { createdAt: 'desc' } });

  const csv = [
    'id,form_type,name,email,phone,subject,status,created_at',
    ...leads.map((l) =>
      [l.id, l.formType, l.name, l.email, l.phone || '', l.subject || '', l.status, l.createdAt.toISOString()]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
  res.send(csv);
}));

router.delete('/leads/:id', requireRole('SuperAdmin', 'ContentManager'), asyncHandler(async (req, res) => {
  await prisma.formSubmission.delete({ where: { id: param(req.params.id) } });
  successResponse(res, { deleted: true });
}));

// --- Team ---
const optionalString = z.preprocess(
  (v) => (v === null || v === '' ? undefined : v),
  z.string().optional()
);

const teamSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  department: optionalString,
  email: z.preprocess(
    (v) => (v === null || v === '' ? undefined : v),
    z.string().email().optional()
  ),
  phone: optionalString,
  bio: optionalString,
  photoId: z.preprocess((v) => (v === null ? undefined : v), z.string().optional()),
  socialLinks: z.preprocess(
    (v) => (v === null ? undefined : v),
    z.record(z.string()).optional()
  ),
  displayOrder: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
});

router.get('/team', asyncHandler(async (_req, res) => {
  const members = await prisma.teamMember.findMany({
    orderBy: { displayOrder: 'asc' },
    include: { photo: true },
  });
  successResponse(res, members);
}));

router.post('/team', requireWrite('team'), asyncHandler(async (req, res) => {
  const data = teamSchema.parse(req.body);
  const member = await prisma.teamMember.create({ data, include: { photo: true } });
  cacheService.clear();
  successResponse(res, member, 201);
}));

router.patch('/team/:id', requireWrite('team'), asyncHandler(async (req, res) => {
  const data = teamSchema.partial().parse(req.body);
  const member = await prisma.teamMember.update({
    where: { id: param(req.params.id) },
    data,
    include: { photo: true },
  });
  cacheService.clear();
  successResponse(res, member);
}));

router.delete('/team/:id', requireWrite('team'), asyncHandler(async (req, res) => {
  await prisma.teamMember.delete({ where: { id: param(req.params.id) } });
  cacheService.clear();
  successResponse(res, { deleted: true });
}));

// --- Testimonials ---
const testimonialSchema = z.object({
  clientName: z.string().min(1),
  company: z.string().optional(),
  position: z.string().optional(),
  title: z.string().optional(),
  quote: z.string().min(10),
  videoUrl: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  serviceIds: z.array(z.string()).optional(),
  photoId: z.string().optional(),
  isApproved: z.boolean().optional(),
});

router.get('/testimonials', asyncHandler(async (_req, res) => {
  const items = await prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
    include: { photo: true },
  });
  successResponse(res, items);
}));

router.post('/testimonials', requireWrite('testimonials'), asyncHandler(async (req: AuthRequest, res) => {
  const data = testimonialSchema.parse(req.body);
  const item = await prisma.testimonial.create({
    data: { ...data, createdById: req.user!.id },
    include: { photo: true },
  });
  successResponse(res, item, 201);
}));

router.patch('/testimonials/:id', requireWrite('testimonials'), asyncHandler(async (req, res) => {
  const data = testimonialSchema.partial().parse(req.body);
  const item = await prisma.testimonial.update({
    where: { id: param(req.params.id) },
    data,
    include: { photo: true },
  });
  successResponse(res, item);
}));

router.delete('/testimonials/:id', requireWrite('testimonials'), asyncHandler(async (req, res) => {
  await prisma.testimonial.delete({ where: { id: param(req.params.id) } });
  successResponse(res, { deleted: true });
}));

// --- FAQs ---
const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

router.get('/faqs', asyncHandler(async (_req, res) => {
  const faqs = await prisma.faq.findMany({ orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }] });
  successResponse(res, faqs);
}));

router.post('/faqs', requireWrite('faqs'), asyncHandler(async (req, res) => {
  const data = faqSchema.parse(req.body);
  const faq = await prisma.faq.create({ data });
  successResponse(res, faq, 201);
}));

router.patch('/faqs/:id', requireWrite('faqs'), asyncHandler(async (req, res) => {
  const data = faqSchema.partial().parse(req.body);
  const faq = await prisma.faq.update({ where: { id: param(req.params.id) }, data });
  successResponse(res, faq);
}));

router.delete('/faqs/:id', requireWrite('faqs'), asyncHandler(async (req, res) => {
  await prisma.faq.delete({ where: { id: param(req.params.id) } });
  successResponse(res, { deleted: true });
}));

// --- Careers ---
const careerSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  level: z.string().optional(),
  type: z.string().optional(),
  benefits: z.string().optional(),
  description: z.string().min(10),
  requirements: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

router.get('/careers', asyncHandler(async (_req, res) => {
  const careers = await prisma.career.findMany({ orderBy: { createdAt: 'desc' } });
  successResponse(res, careers);
}));

router.post('/careers', requireWrite('careers'), asyncHandler(async (req, res) => {
  const data = careerSchema.parse(req.body);
  const slug = data.slug || slugify(data.title);
  const career = await prisma.career.create({ data: { ...data, slug } });
  successResponse(res, career, 201);
}));

router.patch('/careers/:id', requireWrite('careers'), asyncHandler(async (req, res) => {
  const data = careerSchema.partial().parse(req.body);
  const career = await prisma.career.update({ where: { id: param(req.params.id) }, data });
  successResponse(res, career);
}));

router.delete('/careers/:id', requireWrite('careers'), asyncHandler(async (req, res) => {
  await prisma.career.delete({ where: { id: param(req.params.id) } });
  successResponse(res, { deleted: true });
}));

// --- Media ---
router.get('/media', asyncHandler(async (req, res) => {
  const { search } = req.query;
  const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>);
  const where: Record<string, unknown> = {};
  if (search) where.originalFilename = { contains: String(search) };

  const [media, total] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
    prisma.media.count({ where }),
  ]);

  paginatedResponse(res, media, { page, pageSize, total });
}));

router.post('/media', requireWrite('media'), upload.single('file'), asyncHandler(async (req: AuthRequest, res) => {
  if (!req.file) throw new AppError(400, 'NO_FILE', 'No file uploaded');

  const url = `/uploads/${req.file.filename}`;
  const media = await prisma.media.create({
    data: {
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      url,
      uploadedById: req.user!.id,
    },
  });
  successResponse(res, media, 201);
}));

router.patch('/media/:id', requireWrite('media'), asyncHandler(async (req, res) => {
  const { altText, description } = z.object({
    altText: z.string().optional(),
    description: z.string().optional(),
  }).parse(req.body);
  const media = await prisma.media.update({
    where: { id: param(req.params.id) },
    data: { altText, description },
  });
  successResponse(res, media);
}));

router.delete('/media/:id', requireWrite('media'), asyncHandler(async (req, res) => {
  const media = await prisma.media.findUnique({ where: { id: param(req.params.id) } });
  if (media) {
    const filePath = path.join(uploadDir, media.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await prisma.media.delete({ where: { id: param(req.params.id) } });
  }
  successResponse(res, { deleted: true });
}));

// --- Settings ---
router.get('/settings', asyncHandler(async (_req, res) => {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: 1 },
    include: { logo: true, favicon: true },
  });
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: { id: 1 },
      include: { logo: true, favicon: true },
    });
  }
  successResponse(res, settings);
}));

router.patch('/settings', requireRole('SuperAdmin', 'ContentManager'), asyncHandler(async (req: AuthRequest, res) => {
  const parsed = z.object({
    companyName: z.string().optional(),
    tagline: z.string().optional(),
    companyEmail: z.string().optional(),
    companyPhone: z.string().optional(),
    companyAddress: z.string().optional(),
    primaryColor: z.string().optional(),
    socialLinks: z.record(z.string()).optional(),
    seoTitleTemplate: z.string().optional(),
    seoDescriptionTemplate: z.string().optional(),
    googleAnalyticsId: z.string().optional(),
    termsContent: z.string().optional(),
    privacyContent: z.string().optional(),
    aboutContent: z.record(z.unknown()).optional(),
    trustBadges: z.array(z.object({ icon: z.string().optional(), label: z.string(), description: z.string().optional() })).optional(),
    clientLogos: z.array(z.object({ name: z.string(), initial: z.string().optional() })).optional(),
    homeStats: z.array(z.object({ icon: z.string().optional(), value: z.string(), label: z.string() })).optional(),
    homeContent: z.record(z.unknown()).optional(),
    resources: z.array(z.object({
      title: z.string(),
      description: z.string().optional(),
      type: z.string().optional(),
      downloadUrl: z.string().optional(),
    })).optional(),
    heroDescription: z.string().optional(),
    businessHours: z.string().optional(),
    calendlyUrl: z.string().optional(),
    leadMagnetUrl: z.string().optional(),
    crispWebsiteId: z.string().optional(),
    isMaintenanceMode: z.boolean().optional(),
  }).parse(req.body);

  const data = {
    ...parsed,
    aboutContent: parsed.aboutContent as object | undefined,
    homeContent: parsed.homeContent as object | undefined,
    socialLinks: parsed.socialLinks as object | undefined,
  };

  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
    include: { logo: true, favicon: true },
  });
  await logActivity(req.user!.id, 'update', 'settings', '1', data, req.ip);
  cacheService.clear();
  successResponse(res, settings);
}));

// --- Users ---
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().optional(),
  role: z.enum(['SuperAdmin', 'ContentManager', 'Editor', 'Viewer']),
  assignedSections: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

router.get('/users', requireRole('SuperAdmin'), asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const where: Record<string, unknown> = { deletedAt: null };
  if (role) where.role = String(role);
  if (search) where.email = { contains: String(search) };

  const users = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, role: true, isActive: true, lastLogin: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  successResponse(res, users);
}));

router.post('/users', requireRole('SuperAdmin'), asyncHandler(async (req: AuthRequest, res) => {
  const data = userSchema.parse(req.body);
  const password = data.password || 'Temp@123456';
  if (!validatePassword(password)) {
    throw new AppError(400, 'WEAK_PASSWORD', 'Password does not meet requirements');
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      assignedSections: data.assignedSections,
      createdById: req.user!.id,
    },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  successResponse(res, user, 201);
}));

router.patch('/users/:id', requireRole('SuperAdmin'), asyncHandler(async (req, res) => {
  const data = userSchema.partial().parse(req.body);
  const updateData: Record<string, unknown> = { ...data };
  if (data.password) {
    if (!validatePassword(data.password)) throw new AppError(400, 'WEAK_PASSWORD', 'Password does not meet requirements');
    updateData.passwordHash = await hashPassword(data.password);
    delete updateData.password;
  }
  const user = await prisma.user.update({
    where: { id: param(req.params.id) },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  successResponse(res, user);
}));

router.delete('/users/:id', requireRole('SuperAdmin'), asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: param(req.params.id) }, data: { deletedAt: new Date(), isActive: false } });
  successResponse(res, { deleted: true });
}));

// --- Analytics ---
router.get('/analytics/dashboard', asyncHandler(async (_req, res) => {
  const { getDashboardMetrics } = await import('../services/LeadService');
  const metrics = await getDashboardMetrics();
  successResponse(res, metrics);
}));

router.get('/analytics/overview', asyncHandler(async (req, res) => {
  const days = parseInt(String(req.query.days || '30'), 10);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const prevSince = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000);

  const [pageViews, prevPageViews, formSubmissions, totalLeads, newLeads] = await Promise.all([
    prisma.analyticsEvent.count({ where: { eventType: 'page_view', createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { eventType: 'page_view', createdAt: { gte: prevSince, lt: since } } }),
    prisma.analyticsEvent.count({ where: { eventType: 'form_submit', createdAt: { gte: since } } }),
    prisma.formSubmission.count(),
    prisma.formSubmission.count({ where: { createdAt: { gte: since }, status: 'new' } }),
  ]);

  const conversionRate = pageViews > 0 ? ((formSubmissions / pageViews) * 100).toFixed(2) : '0';

  successResponse(res, {
    pageViews,
    pageViewsChange: prevPageViews > 0 ? (((pageViews - prevPageViews) / prevPageViews) * 100).toFixed(1) : '0',
    formSubmissions,
    totalLeads,
    newLeads,
    conversionRate: `${conversionRate}%`,
  });
}));

router.get('/analytics/traffic', asyncHandler(async (req, res) => {
  const days = parseInt(String(req.query.days || '30'), 10);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const events = await prisma.analyticsEvent.findMany({
    where: { eventType: 'page_view', createdAt: { gte: since } },
    select: { createdAt: true, deviceType: true, pageUrl: true, referrer: true },
  });

  const byDevice: Record<string, number> = {};
  const byPage: Record<string, number> = {};
  const byReferrer: Record<string, number> = {};
  const byDay: Record<string, number> = {};

  events.forEach((e) => {
    const device = e.deviceType || 'unknown';
    byDevice[device] = (byDevice[device] || 0) + 1;
    if (e.pageUrl) byPage[e.pageUrl] = (byPage[e.pageUrl] || 0) + 1;
    let ref = 'direct';
    if (e.referrer) {
      try { ref = new URL(e.referrer).hostname; } catch { ref = e.referrer; }
    }
    byReferrer[ref] = (byReferrer[ref] || 0) + 1;
    const day = e.createdAt.toISOString().split('T')[0];
    byDay[day] = (byDay[day] || 0) + 1;
  });

  successResponse(res, {
    byDevice,
    topPages: Object.entries(byPage).sort((a, b) => b[1] - a[1]).slice(0, 10),
    byReferrer: Object.entries(byReferrer).sort((a, b) => b[1] - a[1]).slice(0, 10),
    dailyTrend: Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0])),
  });
}));

router.get('/analytics/conversions', asyncHandler(async (req, res) => {
  const days = parseInt(String(req.query.days || '30'), 10);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const byType = await prisma.formSubmission.groupBy({
    by: ['formType'],
    where: { createdAt: { gte: since } },
    _count: true,
  });

  const byStatus = await prisma.formSubmission.groupBy({
    by: ['status'],
    _count: true,
  });

  successResponse(res, { byType, byStatus });
}));

// --- Activity Logs ---
router.get('/newsletter-subscribers', requireRole('SuperAdmin', 'ContentManager'), asyncHandler(async (req, res) => {
  const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>);
  const [items, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
    prisma.newsletterSubscriber.count(),
  ]);
  paginatedResponse(res, items, { page, pageSize, total });
}));

router.get('/quiz-submissions', requireRole('SuperAdmin', 'ContentManager'), asyncHandler(async (req, res) => {
  const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>);
  const [items, total] = await Promise.all([
    prisma.quizSubmission.findMany({ orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
    prisma.quizSubmission.count(),
  ]);
  paginatedResponse(res, items, { page, pageSize, total });
}));

router.get('/email-logs', requireRole('SuperAdmin', 'ContentManager'), asyncHandler(async (req, res) => {
  const { status, to } = req.query;
  const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>);
  const where: Record<string, unknown> = {};
  if (status) where.status = String(status);
  if (to) where.to = { contains: String(to) };

  const [items, total] = await Promise.all([
    prisma.emailLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
    prisma.emailLog.count({ where }),
  ]);

  paginatedResponse(res, items, { page, pageSize, total });
}));

router.get('/email-stats', requireRole('SuperAdmin', 'ContentManager'), asyncHandler(async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayCount, sentCount, failedCount, pendingCount] = await Promise.all([
    prisma.emailLog.count({ where: { createdAt: { gte: today } } }),
    prisma.emailLog.count({ where: { status: 'sent', createdAt: { gte: today } } }),
    prisma.emailLog.count({ where: { status: 'failed', createdAt: { gte: today } } }),
    prisma.emailLog.count({ where: { status: { in: ['pending', 'skipped'] }, createdAt: { gte: today } } }),
  ]);

  const successRate = todayCount ? Number(((sentCount / todayCount) * 100).toFixed(2)) : 0;
  successResponse(res, {
    todayCount,
    sentCount,
    failedCount,
    pendingCount,
    successRate,
    queue: emailQueueService.getStatus(),
  });
}));

router.get('/activity-logs', requireRole('SuperAdmin'), asyncHandler(async (req, res) => {
  const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>);
  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.activityLog.count(),
  ]);
  paginatedResponse(res, logs, { page, pageSize, total });
}));

export default router;
