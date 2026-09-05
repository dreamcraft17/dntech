'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';

interface Subscriber {
  id: string;
  email: string;
  industry?: string;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/admin/newsletter-subscribers?pageSize=100`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setSubscribers(json.data);
        setTotal(json.pagination?.total ?? json.data.length);
      }
    }
    load().catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pelanggan Newsletter</h1>
      <p className="text-sm text-gray-500 mb-6">{total} pelanggan aktif</p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Industri</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Berlangganan</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{s.email}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">{s.industry || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(s.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 && <p className="text-center text-gray-500 py-8">Belum ada pelanggan</p>}
      </div>
    </div>
  );
}
