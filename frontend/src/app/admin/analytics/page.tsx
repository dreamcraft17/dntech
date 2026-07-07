'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { ConversionChart } from '@/components/admin/ConversionChart';

interface DashboardMetrics {
  todayLeads: number;
  monthLeads: number;
  totalLeads: number;
  conversionRate: string;
  newsletterSubscribers: number;
  quizCompletions: number;
  monthTrend: [string, number][];
  topPages: { page: string; views: number; leads: number }[];
  topLeadSources: Record<string, number>;
  funnel: { pageViews: number; formVisits: number; formSubmits: number; leads: number; conversionRate: string };
  leadsByStatus: { status: string; _count: number }[];
}

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [traffic, setTraffic] = useState<{
    byDevice: Record<string, number>;
    dailyTrend: [string, number][];
  } | null>(null);

  useEffect(() => {
    apiFetch<DashboardMetrics>('/admin/analytics/dashboard').then(setMetrics).catch(console.error);
    apiFetch<typeof traffic>('/admin/analytics/traffic?days=30').then(setTraffic).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Analytics Dashboard</h1>

      {metrics && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            {[
              { label: 'Leads Today', value: metrics.todayLeads },
              { label: 'Leads This Month', value: metrics.monthLeads },
              { label: 'Total Leads', value: metrics.totalLeads },
              { label: 'Conversion Rate', value: metrics.conversionRate },
              { label: 'Newsletter', value: metrics.newsletterSubscribers },
              { label: 'Quiz (30d)', value: metrics.quizCompletions },
            ].map(({ label, value }) => (
              <Card key={label}>
                <div className="text-sm text-slate-500">{label}</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card title="Conversion Funnel & Lead Trend">
              <ConversionChart
                funnel={[
                  { label: 'Page Views', value: metrics.funnel.pageViews },
                  { label: 'Form Visits', value: metrics.funnel.formVisits },
                  { label: 'Form Submits', value: metrics.funnel.formSubmits },
                  { label: 'Leads', value: metrics.funnel.leads },
                ]}
                monthTrend={metrics.monthTrend}
              />
            </Card>

            <Card title="Lead Sources">
              {Object.entries(metrics.topLeadSources).map(([source, count]) => (
                <div key={source} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-600 capitalize">{source}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(metrics.topLeadSources).length === 0 && (
                <p className="text-sm text-slate-500">No lead source data yet</p>
              )}
            </Card>
          </div>

          <Card title="Top Pages (views / leads)" className="mb-6">
            {metrics.topPages.map(({ page, views, leads }) => (
              <div key={page} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-600 truncate">{page}</span>
                <span className="text-sm font-medium ml-2">{views} / {leads}</span>
              </div>
            ))}
          </Card>
        </>
      )}

      {traffic?.byDevice && (
        <Card title="Traffic by Device">
          {Object.entries(traffic.byDevice).map(([device, count]) => (
            <div key={device} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm capitalize text-slate-600">{device}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
