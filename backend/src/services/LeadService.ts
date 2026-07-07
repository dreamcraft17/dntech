import prisma from '../config/database';
import { LeadStatus } from '@prisma/client';
import { sendWelcomeEmail } from './EmailService';

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  serviceType?: string;
  projectType?: string;
  budgetRange?: string;
  message?: string;
  source?: string;
  pageSource?: string;
}

export function categorizeLead(serviceType?: string, budget?: string): string {
  if (!serviceType) return 'general';
  const svc = serviceType.toLowerCase();
  if (svc.includes('enterprise') || budget?.includes('100000')) return 'enterprise';
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
      message: data.message || '',
      subject: `Lead: ${data.serviceType || data.projectType || 'General'}`,
      source: data.source || 'contact-form',
      pageSource: data.pageSource,
      leadCategory,
      status: isDuplicate ? 'new' : 'new',
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

  sendWelcomeEmail(data.email, data.name).catch(console.error);

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
