'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetchPaginated, apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface EmailLog {
  id: string;
  to: string;
  from: string;
  subject: string;
  templateId?: string;
  status: string;
  messageId?: string;
  error?: string;
  attempts: number;
  createdAt: string;
  sentAt?: string;
}

interface EmailStats {
  todayCount: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  successRate: number;
  queue: {
    queueLength: number;
    activeJobs: number;
    isProcessing: boolean;
  };
}

export default function AdminEmailLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    const params = status ? `?status=${encodeURIComponent(status)}` : '';
    const [{ data }, emailStats] = await Promise.all([
      apiFetchPaginated<EmailLog[]>(`/admin/email-logs${params}`),
      apiFetch<EmailStats>('/admin/email-stats'),
    ]);
    setLogs(Array.isArray(data) ? data : []);
    setStats(emailStats);
  }, [status]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      load().catch(console.error);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [load]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Email Log</h1>
        <p className="text-sm text-slate-500">Monitoring pengiriman email SMTP DN Tech.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Stat label="Hari Ini" value={stats.todayCount} />
          <Stat label="Terkirim" value={stats.sentCount} />
          <Stat label="Gagal" value={stats.failedCount} />
          <Stat label="Pending" value={stats.pendingCount} />
          <Stat label="Success Rate" value={`${stats.successRate}%`} />
        </div>
      )}

      <div className="mb-4 flex gap-2">
        {['', 'sent', 'failed', 'pending', 'skipped'].map((item) => (
          <button
            key={item || 'all'}
            onClick={() => setStatus(item)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              status === item ? 'bg-blue-900 text-white' : 'border border-slate-200 bg-white text-slate-600'
            }`}
          >
            {item || 'Semua'}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Waktu</th>
              <th className="px-4 py-3 font-medium">To</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Template</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-slate-500">{formatDate(log.createdAt)}</td>
                <td className="px-4 py-3 text-slate-700">{log.to}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{log.subject}</div>
                  {log.error && <div className="mt-1 text-xs text-red-600">{log.error}</div>}
                </td>
                <td className="px-4 py-3 text-slate-500">{log.templateId || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(log.status)}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Belum ada email log.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function statusClass(status: string) {
  if (status === 'sent') return 'bg-green-100 text-green-700';
  if (status === 'failed') return 'bg-red-100 text-red-700';
  if (status === 'pending') return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-700';
}
