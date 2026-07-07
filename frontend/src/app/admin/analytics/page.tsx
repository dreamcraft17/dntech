'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/Card';

interface DashboardMetrics {
  todayLeads: number;
  monthLeads: number;
  totalLeads: number;
  conversionRate: string;
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
    topPages: [string, number][];
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Leads Today', value: metrics.todayLeads },
              { label: 'Leads This Month', value: metrics.monthLeads },
              { label: 'Total Leads', value: metrics.totalLeads },
              { label: 'Conversion Rate', value: metrics.conversionRate },
            ].map(({ label, value }) => (
              <Card key={label}>
                <div className="text-sm text-slate-500">{label}</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card title="Conversion Funnel (30 days)">
              {[
                { label: 'Page Views', value: metrics.funnel.pageViews },
                { label: 'Form Visits', value: metrics.funnel.formVisits },
                { label: 'Form Submits', value: metrics.funnel.formSubmits },
                { label: 'Leads', value: metrics.funnel.leads },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
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

          <Card title="Leads by Status" className="mb-6">
            {metrics.leadsByStatus.map(({ status, _count }) => (
              <div key={status} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-600 capitalize">{status}</span>
                <span className="font-medium">{_count}</span>
              </div>
            ))}
          </Card>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Traffic by Device">
          {traffic?.byDevice && Object.entries(traffic.byDevice).map(([device, count]) => (
            <div key={device} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm capitalize text-slate-600">{device}</span>
              <span className="text-sm font-medium text-slate-900">{count}</span>
            </div>
          ))}
        </Card>

        {traffic?.dailyTrend && traffic.dailyTrend.length > 0 && (
          <Card title="Daily Page Views">
            <div className="flex items-end gap-1 h-32">
              {traffic.dailyTrend.map(([day, count]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-600 rounded-t"
                    style={{ height: `${Math.max((count / Math.max(...traffic.dailyTrend.map(([, c]) => c))) * 100, 4)}%` }}
                    title={`${day}: ${count}`}
                  />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
