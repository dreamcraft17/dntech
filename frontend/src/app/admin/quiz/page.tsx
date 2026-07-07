'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface QuizSubmission {
  id: string;
  result: string;
  recommendedService?: string;
  email?: string;
  name?: string;
  createdAt: string;
}

export default function AdminQuizPage() {
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    apiFetch<QuizSubmission[]>('/admin/quiz-submissions?pageSize=100')
      .then((data) => {
        setSubmissions(data);
        setTotal(data.length);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Pengiriman Kuis</h1>
      <p className="text-sm text-slate-500 mb-6">{total} total penyelesaian</p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Hasil</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Rekomendasi</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 capitalize text-slate-900">{s.result}</td>
                <td className="px-4 py-3 text-slate-600">{s.recommendedService || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{s.email || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(s.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {submissions.length === 0 && <p className="text-center text-slate-500 py-8">Belum ada pengiriman kuis</p>}
      </div>
    </div>
  );
}
