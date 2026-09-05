jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    analyticsEvent: { count: jest.fn(), findMany: jest.fn() },
    formSubmission: { count: jest.fn(), groupBy: jest.fn() },
    emailLog: { findMany: jest.fn(), count: jest.fn() },
    activityLog: { findMany: jest.fn(), count: jest.fn() },
  },
}));

jest.mock('../../services/EmailQueueService', () => ({
  emailQueueService: { getStatus: jest.fn().mockReturnValue({ pending: 0 }) },
}));

jest.mock('../../services/LeadService', () => ({
  getDashboardMetrics: jest.fn().mockResolvedValue({ todayLeads: 5 }),
}));

const prisma = require('../../config/database').default;
const {
  getDashboardMetrics,
  getAnalyticsOverview,
  getEmailStats,
  listActivityLogs,
} = require('../../services/AdminAnalyticsService');

describe('AdminAnalyticsService', () => {
  beforeEach(() => {
    // jest.config.js sets resetMocks:true, which wipes mockResolvedValue/mockReturnValue
    // set at jest.mock() factory time before every test — so (re)establish defaults here.
    const { emailQueueService } = require('../../services/EmailQueueService');
    const leadService = require('../../services/LeadService');
    emailQueueService.getStatus.mockReturnValue({ pending: 0 });
    leadService.getDashboardMetrics.mockResolvedValue({ todayLeads: 5 });
  });

  it('delegates dashboard metrics to LeadService', async () => {
    const result = await getDashboardMetrics();
    expect(result).toEqual({ todayLeads: 5 });
  });

  it('computes overview conversion rate from page views + form submissions', async () => {
    prisma.analyticsEvent.count
      .mockResolvedValueOnce(100) // pageViews
      .mockResolvedValueOnce(50) // prevPageViews
      .mockResolvedValueOnce(10); // formSubmissions (form_submit events)
    prisma.formSubmission.count
      .mockResolvedValueOnce(200) // totalLeads
      .mockResolvedValueOnce(3); // newLeads

    const result = await getAnalyticsOverview(30);

    expect(result.conversionRate).toBe('10.00%');
    expect(result.pageViewsChange).toBe('100.0');
  });

  it('returns 0% conversion rate when there are no page views', async () => {
    prisma.analyticsEvent.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    prisma.formSubmission.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0).mockResolvedValueOnce(0);

    const result = await getAnalyticsOverview(30);

    expect(result.conversionRate).toBe('0%');
  });

  it('computes today success rate and includes queue status', async () => {
    prisma.emailLog.count
      .mockResolvedValueOnce(10) // todayCount
      .mockResolvedValueOnce(8) // sentCount
      .mockResolvedValueOnce(1) // failedCount
      .mockResolvedValueOnce(1); // pendingCount

    const result = await getEmailStats();

    expect(result.successRate).toBe(80);
    expect(result.queue).toEqual({ pending: 0 });
  });

  it('paginates activity logs', async () => {
    prisma.activityLog.findMany.mockResolvedValueOnce([{ id: 'log_1' }]);
    prisma.activityLog.count.mockResolvedValueOnce(1);

    const result = await listActivityLogs({ page: '1', pageSize: '20' });

    expect(result.logs).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});

export {};
