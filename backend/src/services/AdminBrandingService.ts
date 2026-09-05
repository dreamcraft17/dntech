import { z } from 'zod';
import prisma from '../config/database';
import { param } from '../utils/helpers';
import { cacheService } from '../services/CacheService';

/**
 * Admin CRUD logic for the "brand" / about-page content types, extracted
 * from backend/src/routes/admin-branding.ts. Behavior preserved 1:1.
 */

// --- Brand content ---
const brandContentSchema = z.object({
  tagline: z.string().min(1),
  story: z.string().min(1),
  mission: z.string().min(1),
  imageUrl: z.string().optional().nullable(),
});

export async function getBrandContent() {
  return prisma.brandContent.findFirst({ orderBy: { updatedAt: 'desc' } });
}

export async function upsertBrandContent(body: unknown) {
  const payload = brandContentSchema.parse(body);

  const existing = await prisma.brandContent.findFirst({ orderBy: { updatedAt: 'desc' } });
  const content = existing
    ? await prisma.brandContent.update({ where: { id: existing.id }, data: payload })
    : await prisma.brandContent.create({ data: payload });

  cacheService.clear();
  return content;
}

// --- Core values ---
const valueSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  iconName: z.string().min(1),
  order: z.number().int().optional(),
});

export async function listCoreValues() {
  return prisma.coreValue.findMany({ orderBy: { order: 'asc' } });
}

export async function createCoreValue(body: unknown) {
  const data = valueSchema.parse(body);
  const created = await prisma.coreValue.create({ data: { ...data, order: data.order ?? 0 } });
  cacheService.clear();
  return created;
}

export async function updateCoreValue(id: string, body: unknown) {
  const data = valueSchema.partial().parse(body);
  const updated = await prisma.coreValue.update({ where: { id: param(id) }, data });
  cacheService.clear();
  return updated;
}

export async function deleteCoreValue(id: string) {
  await prisma.coreValue.delete({ where: { id: param(id) } });
  cacheService.clear();
}

// --- Competitive advantages ---
const advantageSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  iconName: z.string().min(1),
  order: z.number().int().optional(),
});

export async function listAdvantages() {
  return prisma.competitiveAdvantage.findMany({ orderBy: { order: 'asc' } });
}

export async function createAdvantage(body: unknown) {
  const data = advantageSchema.parse(body);
  const created = await prisma.competitiveAdvantage.create({ data: { ...data, order: data.order ?? 0 } });
  cacheService.clear();
  return created;
}

export async function updateAdvantage(id: string, body: unknown) {
  const data = advantageSchema.partial().parse(body);
  const updated = await prisma.competitiveAdvantage.update({ where: { id: param(id) }, data });
  cacheService.clear();
  return updated;
}

export async function deleteAdvantage(id: string) {
  await prisma.competitiveAdvantage.delete({ where: { id: param(id) } });
  cacheService.clear();
}

// --- Team (branding-page shape) ---
const brandTeamSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});

function mapTeamMember(member: {
  id: string; name: string; role: string; bio: string | null;
  photo?: { url: string } | null; socialLinks: unknown; displayOrder: number; isActive: boolean;
}) {
  return {
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
  };
}

export async function listBrandTeam() {
  const team = await prisma.teamMember.findMany({
    include: { photo: true },
    orderBy: { displayOrder: 'asc' },
  });
  return team.map(mapTeamMember);
}

export async function createBrandTeamMember(body: unknown) {
  const data = brandTeamSchema.parse(body);
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
  return created;
}

export async function updateBrandTeamMember(id: string, body: unknown) {
  const data = brandTeamSchema.partial().parse(body);
  const existing = await prisma.teamMember.findUnique({ where: { id: param(id) } });
  const existingSocial = (existing?.socialLinks as Record<string, unknown> | null) || {};
  const socialLinks = {
    ...existingSocial,
    ...(data.linkedinUrl !== undefined ? { linkedin: data.linkedinUrl } : {}),
    ...(data.twitterUrl !== undefined ? { twitter: data.twitterUrl } : {}),
    ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
  };

  const updated = await prisma.teamMember.update({
    where: { id: param(id) },
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
  return updated;
}

export async function deleteBrandTeamMember(id: string) {
  await prisma.teamMember.delete({ where: { id: param(id) } });
  cacheService.clear();
}

// --- Testimonials (branding-page shape) ---
const brandTestimonialSchema = z.object({
  quote: z.string().min(1),
  author: z.string().min(1),
  title: z.string().min(1),
  company: z.string().optional(),
  logoUrl: z.string().optional(),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function listBrandTestimonials() {
  const items = await prisma.testimonial.findMany({
    include: { photo: true },
    orderBy: { createdAt: 'asc' },
  });
  return items.map((item, index) => ({
    id: item.id,
    quote: item.quote,
    author: item.clientName,
    title: item.title || item.position || '',
    company: item.company || '',
    logoUrl: item.photo?.url || '',
    published: item.isApproved,
    order: index,
  }));
}

export async function createBrandTestimonial(body: unknown) {
  const data = brandTestimonialSchema.parse(body);
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
  return created;
}

export async function updateBrandTestimonial(id: string, body: unknown) {
  const data = brandTestimonialSchema.partial().parse(body);
  const updated = await prisma.testimonial.update({
    where: { id: param(id) },
    data: {
      ...(data.quote !== undefined ? { quote: data.quote } : {}),
      ...(data.author !== undefined ? { clientName: data.author } : {}),
      ...(data.title !== undefined ? { title: data.title, position: data.title } : {}),
      ...(data.company !== undefined ? { company: data.company } : {}),
      ...(data.published !== undefined ? { isApproved: data.published } : {}),
    },
  });
  cacheService.clear();
  return updated;
}

export async function deleteBrandTestimonial(id: string) {
  await prisma.testimonial.delete({ where: { id: param(id) } });
  cacheService.clear();
}

// --- Stats ---
const statSchema = z.object({
  label: z.string().min(1),
  value: z.number().int(),
  iconName: z.string().min(1),
  order: z.number().int().optional(),
});

export async function listStats() {
  return prisma.stat.findMany({ orderBy: { order: 'asc' } });
}

export async function createStat(body: unknown) {
  const data = statSchema.parse(body);
  const created = await prisma.stat.create({ data: { ...data, order: data.order ?? 0 } });
  cacheService.clear();
  return created;
}

export async function updateStat(id: string, body: unknown) {
  const data = statSchema.partial().parse(body);
  const updated = await prisma.stat.update({ where: { id: param(id) }, data });
  cacheService.clear();
  return updated;
}

export async function deleteStat(id: string) {
  await prisma.stat.delete({ where: { id: param(id) } });
  cacheService.clear();
}
