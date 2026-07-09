'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Users, Eye, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Overview {
  pageViews: number;
  pageViewsChange: string;
  formSubmissions: number;
  totalLeads: number;
  newLeads: number;
  conversionRate: string;
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    apiFetch<Overview>('/admin/analytics/overview').then(setOverview).catch(console.error);
  }, []);

  const stats = [
    { label: 'Tampilan Halaman (30 hr)', value: overview?.pageViews ?? '-', change: overview?.pageViewsChange, icon: Eye, color: 'blue' },
    { label: 'Pengiriman Formulir', value: overview?.formSubmissions ?? '-', icon: MessageSquare, color: 'green' },
    { label: 'Total Lead', value: overview?.totalLeads ?? '-', icon: Users, color: 'purple' },
    { label: 'Tingkat Konversi', value: overview?.conversionRate ?? '-', icon: TrendingUp, color: 'orange' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dasbor</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, change, icon: Icon }) => (
          <Card key={label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                {change && <p className="text-xs text-green-600 mt-1">{change}% vs periode sebelumnya</p>}
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icon className="h-5 w-5 text-blue-900" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Aksi Cepat">
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/services', label: 'Kelola Layanan' },
              { href: '/admin/blog', label: 'Artikel Blog Baru' },
              { href: '/admin/leads', label: 'Lihat Lead' },
              { href: '/admin/newsletter', label: 'Newsletter' },
              { href: '/admin/quiz', label: 'Hasil Kuis' },
              { href: '/admin/analytics', label: 'Analitik' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="p-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-900 transition-colors text-center">
                {label}
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Lead Baru">
          <p className="text-3xl font-bold text-gray-900">{overview?.newLeads ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Lead belum dibaca bulan ini</p>
          <Link href="/admin/leads" className="mt-4 inline-block text-sm text-blue-900 font-medium hover:underline">
            Lihat semua lead →
          </Link>
        </Card>
      </div>
    </div>
  );
}
