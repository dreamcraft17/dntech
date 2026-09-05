import { z } from 'zod';
import prisma from '../config/database';
import { slugify, param } from '../utils/helpers';
import { cacheService } from '../services/CacheService';

/**
 * Admin CRUD logic for the simpler "directory" content types (team members,
 * testimonials, FAQs, careers) previously inlined in
 * backend/src/routes/admin.ts. Behavior and response shapes preserved 1:1.
 */

// --- Team ---
const optionalString = z.preprocess(
  (v) => (v === null || v === '' ? undefined : v),
  z.string().optional()
);

export const teamSchema = z.object({
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
    z.record(z.string(), z.string()).optional()
  ),
  displayOrder: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
});

export async function listTeamMembers() {
  return prisma.teamMember.findMany({
    orderBy: { displayOrder: 'asc' },
    include: { photo: true },
  });
}

export async function createTeamMember(body: unknown) {
  const data = teamSchema.parse(body);
  const member = await prisma.teamMember.create({ data, include: { photo: true } });
  cacheService.clear();
  return member;
}

export async function updateTeamMember(id: string, body: unknown) {
  const data = teamSchema.partial().parse(body);
  const member = await prisma.teamMember.update({
    where: { id: param(id) },
    data,
    include: { photo: true },
  });
  cacheService.clear();
  return member;
}

export async function deleteTeamMember(id: string) {
  await prisma.teamMember.delete({ where: { id: param(id) } });
  cacheService.clear();
}

// --- Testimonials ---
export const testimonialSchema = z.object({
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

export async function listTestimonials() {
  return prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
    include: { photo: true },
  });
}

export async function createTestimonial(body: unknown, userId: string) {
  const data = testimonialSchema.parse(body);
  return prisma.testimonial.create({
    data: { ...data, createdById: userId },
    include: { photo: true },
  });
}

export async function updateTestimonial(id: string, body: unknown) {
  const data = testimonialSchema.partial().parse(body);
  return prisma.testimonial.update({
    where: { id: param(id) },
    data,
    include: { photo: true },
  });
}

export async function deleteTestimonial(id: string) {
  await prisma.testimonial.delete({ where: { id: param(id) } });
}

// --- FAQs ---
export const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function listFaqs() {
  return prisma.faq.findMany({ orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }] });
}

export async function createFaq(body: unknown) {
  const data = faqSchema.parse(body);
  return prisma.faq.create({ data });
}

export async function updateFaq(id: string, body: unknown) {
  const data = faqSchema.partial().parse(body);
  return prisma.faq.update({ where: { id: param(id) }, data });
}

export async function deleteFaq(id: string) {
  await prisma.faq.delete({ where: { id: param(id) } });
}

// --- Careers ---
export const careerSchema = z.object({
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

export async function listCareers() {
  return prisma.career.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function createCareer(body: unknown) {
  const data = careerSchema.parse(body);
  const slug = data.slug || slugify(data.title);
  return prisma.career.create({ data: { ...data, slug } });
}

export async function updateCareer(id: string, body: unknown) {
  const data = careerSchema.partial().parse(body);
  return prisma.career.update({ where: { id: param(id) }, data });
}

export async function deleteCareer(id: string) {
  await prisma.career.delete({ where: { id: param(id) } });
}
