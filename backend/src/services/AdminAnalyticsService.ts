import prisma from '../config/database';
import { getPagination } from '../utils/helpers';
import { emailQueueService } from '../services/EmailQueueService';
import { getDashboardMetrics as getLeadDashboardMetrics } from '../services/LeadService';

/**
 * Read-only admin analytics/reporting queries, extracted from
 * backend/src/routes/admin.ts. Behavior preserved 1:1.
 */

export async function getDashboardMetrics() {
  return getLeadDashboardMetrics();
}

export async function getAnalyticsOverview(days: number) {
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

  return {
    pageViews,
    pageViewsChange: prevPageViews > 0 ? (((pageViews - prevPageViews) / prevPageViews) * 100).toFixed(1) : '0',
    formSubmissions,
    totalLeads,
    newLeads,
    conversionRate: `${conversionRate}%`,
  };
}

export async function getAnalyticsTraffic(days: number) {
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

  return {
    byDevice,
    topPages: Object.entries(byPage).sort((a, b) => b[1] - a[1]).slice(0, 10),
    byReferrer: Object.entries(byReferrer).sort((a, b) => b[1] - a[1]).slice(0, 10),
    dailyTrend: Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0])),
  };
}

export async function getAnalyticsConversions(days: number) {
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

  return { byType, byStatus };
}

export async function listNewsletterSubscribers(query: Record<string, unknown>) {
  const { page, pageSize, skip } = getPagination(query);
  const [items, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
    prisma.newsletterSubscriber.count(),
  ]);
  return { items, page, pageSize, total };
}

export async function listQuizSubmissions(query: Record<string, unknown>) {
  const { page, pageSize, skip } = getPagination(query);
  const [items, total] = await Promise.all([
    prisma.quizSubmission.findMany({ orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
    prisma.quizSubmission.count(),
  ]);
  return { items, page, pageSize, total };
}

export async function listEmailLogs(query: Record<string, unknown>) {
  const { status, to } = query;
  const { page, pageSize, skip } = getPagination(query);
  const where: Record<string, unknown> = {};
  if (status) where.status = String(status);
  if (to) where.to = { contains: String(to) };

  const [items, total] = await Promise.all([
    prisma.emailLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
    prisma.emailLog.count({ where }),
  ]);

  return { items, page, pageSize, total };
}

export async function getEmailStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayCount, sentCount, failedCount, pendingCount] = await Promise.all([
    prisma.emailLog.count({ where: { createdAt: { gte: today } } }),
    prisma.emailLog.count({ where: { status: 'sent', createdAt: { gte: today } } }),
    prisma.emailLog.count({ where: { status: 'failed', createdAt: { gte: today } } }),
    prisma.emailLog.count({ where: { status: { in: ['pending', 'skipped'] }, createdAt: { gte: today } } }),
  ]);

  const successRate = todayCount ? Number(((sentCount / todayCount) * 100).toFixed(2)) : 0;
  return {
    todayCount,
    sentCount,
    failedCount,
    pendingCount,
    successRate,
    queue: emailQueueService.getStatus(),
  };
}

export async function listActivityLogs(query: Record<string, unknown>) {
  const { page, pageSize, skip } = getPagination(query);
  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.activityLog.count(),
  ]);
  return { logs, page, pageSize, total };
}
