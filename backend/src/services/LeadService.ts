import prisma from '../config/database';
import { LeadStatus } from '@prisma/client';
import { sendWelcomeEmail, sendLeadNotification } from './EmailService';
import logger from '../config/logger';
import { getPagination, param, AppError } from '../utils/helpers';
import { z } from 'zod';

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  serviceType?: string;
  projectType?: string;
  budgetRange?: string;
  timeline?: string;
  message?: string;
  source?: string;
  pageSource?: string;
}

export function categorizeLead(serviceType?: string, budget?: string): string {
  if (!serviceType) return 'general';
  const svc = serviceType.toLowerCase();
  const enterpriseBudgets = new Set([
    '500k+', '100k-500k', '5m-plus', '1m-5m', 'large', 'enterprise-budget',
  ]);
  if (svc.includes('enterprise') || (budget && enterpriseBudgets.has(budget))) return 'enterprise';
  if (svc.includes('web') || svc.includes('mobile')) return 'product';
  if (svc.includes('cloud') || svc.includes('devops')) return 'infrastructure';
  if (svc.includes('consult')) return 'consulting';
  return 'general';
}

export async function checkDuplicateEmail(email: string): Promise<boolean> {
  const existing = await prisma.formSubmission.findFirst({
    where: { email, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
  });
  return !!existing;
}

export async function createLead(data: LeadInput, meta?: { ip?: string; userAgent?: string }) {
  const isDuplicate = await checkDuplicateEmail(data.email);
  const leadCategory = categorizeLead(data.serviceType || data.projectType, data.budgetRange);

  const submission = await prisma.formSubmission.create({
    data: {
      formType: 'contact',
      name: data.name,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName,
      serviceInterested: data.serviceType,
      projectType: data.projectType,
      budgetRange: data.budgetRange,
      timeline: data.timeline,
      message: data.message || '',
      subject: `Lead: ${data.serviceType || data.projectType || 'Umum'}`,
      source: data.source || 'contact-form',
      pageSource: data.pageSource,
      leadCategory,
      status: 'new',
      notes: isDuplicate ? '[System] Possible duplicate submission within 30 days' : undefined,
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    },
  });

  // Mark conversion in funnel
  await prisma.conversionFunnel.create({
    data: {
      sessionId: 'lead-' + submission.id,
      eventType: 'form_submit',
      pageUrl: data.pageSource || '/contact',
      leadSource: data.source || 'direct',
      convertedToLead: true,
    },
  });

  await prisma.analyticsEvent.create({
    data: {
      eventType: 'form_submit',
      pageUrl: data.pageSource || '/contact',
      leadSource: data.source || 'direct',
      conversionStatus: 'converted',
      deviceType: 'unknown',
    },
  });

  sendWelcomeEmail(data.email, data.name, data.serviceType || data.projectType).catch((err) => logger.error({ err }, "Background email send failed"));
  sendLeadNotification(data).catch((err) => logger.error({ err }, "Background email send failed"));

  return { submission, isDuplicate, leadCategory };
}

export async function trackFunnelEvent(data: {
  sessionId: string;
  eventType: string;
  pageUrl: string;
  leadSource?: string;
  convertedToLead?: boolean;
  metadata?: object;
}) {
  return prisma.conversionFunnel.create({ data });
}

export async function getFunnelMetrics(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [pageViews, formVisits, formSubmits, leads] = await Promise.all([
    prisma.conversionFunnel.count({ where: { eventType: 'page_view', createdAt: { gte: since } } }),
    prisma.conversionFunnel.count({ where: { eventType: 'form_visit', createdAt: { gte: since } } }),
    prisma.conversionFunnel.count({ where: { eventType: 'form_submit', createdAt: { gte: since } } }),
    prisma.formSubmission.count({ where: { createdAt: { gte: since } } }),
  ]);

  const visitors = Math.max(pageViews, 1);
  const conversionRate = ((leads / visitors) * 100).toFixed(2);

  return { pageViews, formVisits, formSubmits, leads, conversionRate: `${conversionRate}%` };
}

export async function getDashboardMetrics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [todayLeads, monthLeads, allLeads, pageViews, newsletterTotal, quizTotal, quizMonth] = await Promise.all([
    prisma.formSubmission.count({ where: { createdAt: { gte: today } } }),
    prisma.formSubmission.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.formSubmission.count(),
    prisma.analyticsEvent.count({ where: { eventType: 'page_view', createdAt: { gte: thirtyDaysAgo } } }),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.quizSubmission.count(),
    prisma.quizSubmission.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  const conversionRate = pageViews > 0 ? ((monthLeads / pageViews) * 100).toFixed(2) : '0';

  // Month trend (last 30 days)
  const submissions = await prisma.formSubmission.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  });
  const trendMap: Record<string, number> = {};
  submissions.forEach((s) => {
    const day = s.createdAt.toISOString().split('T')[0];
    trendMap[day] = (trendMap[day] || 0) + 1;
  });
  const monthTrend = Object.entries(trendMap).sort((a, b) => a[0].localeCompare(b[0]));

  // Top pages
  const events = await prisma.analyticsEvent.findMany({
    where: { eventType: 'page_view', createdAt: { gte: thirtyDaysAgo } },
    select: { pageUrl: true },
  });
  const pageMap: Record<string, number> = {};
  events.forEach((e) => {
    if (e.pageUrl) pageMap[e.pageUrl] = (pageMap[e.pageUrl] || 0) + 1;
  });
  const leadByPage = await prisma.formSubmission.groupBy({
    by: ['pageSource'],
    where: { createdAt: { gte: thirtyDaysAgo }, pageSource: { not: null } },
    _count: true,
  });
  const leadPageMap = Object.fromEntries(leadByPage.map((l) => [l.pageSource, l._count]));
  const topPages = Object.entries(pageMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, views]) => ({ page, views, leads: leadPageMap[page] || 0 }));

  // Lead sources
  const sourceEvents = await prisma.analyticsEvent.groupBy({
    by: ['leadSource'],
    where: { createdAt: { gte: thirtyDaysAgo }, leadSource: { not: null } },
    _count: true,
  });
  const topLeadSources = Object.fromEntries(
    sourceEvents.map((s) => [s.leadSource || 'unknown', s._count])
  );

  // Lead status breakdown
  const byStatus = await prisma.formSubmission.groupBy({
    by: ['status'],
    _count: true,
  });

  return {
    todayLeads,
    monthLeads,
    totalLeads: allLeads,
    conversionRate: `${conversionRate}%`,
    newsletterSubscribers: newsletterTotal,
    quizCompletions: quizMonth,
    totalQuizSubmissions: quizTotal,
    monthTrend,
    topPages,
    topLeadSources,
    funnel: await getFunnelMetrics(30),
    leadsByStatus: byStatus,
  };
}

// --- Admin lead-management operations ---
// Extracted from backend/src/routes/admin.ts (the "/leads" admin endpoints).
// Behavior preserved 1:1.

export async function listLeadsAdmin(query: Record<string, unknown>) {
  const { status, formType, search } = query;
  const { page, pageSize, skip } = getPagination(query);
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

  return { leads, page, pageSize, total };
}

export async function getLeadByIdAdmin(id: string) {
  const lead = await prisma.formSubmission.findUnique({
    where: { id: param(id) },
    include: { assignedTo: { select: { id: true, name: true, email: true } } },
  });
  if (!lead) throw new AppError(404, 'NOT_FOUND', 'Lead not found');
  await prisma.formSubmission.update({ where: { id: lead.id }, data: { isRead: true } });
  return lead;
}

export async function updateLeadStatus(id: string, body: unknown) {
  const { status } = z.object({
    status: z.enum(['new', 'contacted', 'qualified', 'converted', 'rejected']),
  }).parse(body);
  return prisma.formSubmission.update({
    where: { id: param(id) },
    data: { status },
  });
}

export async function assignLead(id: string, body: unknown) {
  const { assignedToId } = z.object({ assignedToId: z.string() }).parse(body);
  return prisma.formSubmission.update({
    where: { id: param(id) },
    data: { assignedToId },
    include: { assignedTo: { select: { name: true, email: true } } },
  });
}

export async function addLeadNote(id: string, body: unknown) {
  const { note } = z.object({ note: z.string().min(1) }).parse(body);
  const existing = await prisma.formSubmission.findUnique({ where: { id: param(id) } });
  const notes = existing?.notes ? `${existing.notes}\n\n[${new Date().toISOString()}] ${note}` : note;
  return prisma.formSubmission.update({
    where: { id: param(id) },
    data: { notes },
  });
}

export async function exportLeadsCsv(body: { status?: string; formType?: string } | undefined) {
  const { status, formType } = body || {};
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (formType) where.formType = formType;

  const leads = await prisma.formSubmission.findMany({ where, orderBy: { createdAt: 'desc' } });

  return [
    'id,form_type,name,email,phone,subject,status,created_at',
    ...leads.map((l) =>
      [l.id, l.formType, l.name, l.email, l.phone || '', l.subject || '', l.status, l.createdAt.toISOString()]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n');
}

export async function deleteLeadAdmin(id: string) {
  await prisma.formSubmission.delete({ where: { id: param(id) } });
}

function detectLeadSource(referrer?: string): string {
  if (!referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname;
    if (host.includes('google') || host.includes('bing')) return 'organic';
    if (host.includes('facebook') || host.includes('linkedin') || host.includes('twitter')) return 'referral';
    return 'referral';
  } catch {
    return 'direct';
  }
}

export { detectLeadSource };
