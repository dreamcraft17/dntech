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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dasbor Analitik</h1>

      {metrics && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            {[
              { label: 'Lead Hari Ini', value: metrics.todayLeads },
              { label: 'Lead Bulan Ini', value: metrics.monthLeads },
              { label: 'Total Lead', value: metrics.totalLeads },
              { label: 'Tingkat Konversi', value: metrics.conversionRate },
              { label: 'Newsletter', value: metrics.newsletterSubscribers },
              { label: 'Kuis (30 hr)', value: metrics.quizCompletions },
            ].map(({ label, value }) => (
              <Card key={label}>
                <div className="text-sm text-gray-500">{label}</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card title="Corong Konversi & Tren Lead">
              <ConversionChart
                funnel={[
                  { label: 'Tampilan Halaman', value: metrics.funnel.pageViews },
                  { label: 'Kunjungan Formulir', value: metrics.funnel.formVisits },
                  { label: 'Pengiriman Formulir', value: metrics.funnel.formSubmits },
                  { label: 'Lead', value: metrics.funnel.leads },
                ]}
                monthTrend={metrics.monthTrend}
              />
            </Card>

            <Card title="Sumber Lead">
              {Object.entries(metrics.topLeadSources).map(([source, count]) => (
                <div key={source} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600 capitalize">{source}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(metrics.topLeadSources).length === 0 && (
                <p className="text-sm text-gray-500">Belum ada data sumber lead</p>
              )}
            </Card>
          </div>

          <Card title="Halaman Teratas (tampilan / lead)" className="mb-6">
            {metrics.topPages.map(({ page, views, leads }) => (
              <div key={page} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600 truncate">{page}</span>
                <span className="text-sm font-medium ml-2">{views} / {leads}</span>
              </div>
            ))}
          </Card>
        </>
      )}

      {traffic?.byDevice && (
        <Card title="Lalu Lintas per Perangkat">
          {Object.entries(traffic.byDevice).map(([device, count]) => (
            <div key={device} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm capitalize text-gray-600">{device}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
