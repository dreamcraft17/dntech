'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, apiFetchPaginated } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { X } from 'lucide-react';
import type { Lead } from '@/types';
import { formatDate } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  '': 'Semua',
  new: 'Baru',
  contacted: 'Dihubungi',
  qualified: 'Berkualifikasi',
  converted: 'Terkonversi',
  rejected: 'Ditolak',
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [filter, setFilter] = useState('');
  const [note, setNote] = useState('');

  const loadLeads = useCallback(async () => {
    const params = filter ? `?status=${filter}` : '';
    const { data } = await apiFetchPaginated<Lead[]>(`/admin/leads${params}`);
    setLeads(Array.isArray(data) ? data : []);
  }, [filter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadLeads().catch(console.error);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadLeads]);

  async function updateStatus(id: string, status: string) {
    await apiFetch(`/admin/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    loadLeads();
    if (selected?.id === id) setSelected({ ...selected, status });
  }

  async function addNote(id: string) {
    if (!note.trim()) return;
    await apiFetch(`/admin/leads/${id}/notes`, { method: 'POST', body: JSON.stringify({ note }) });
    setNote('');
    const updated = await apiFetch<Lead>(`/admin/leads/${id}`);
    setSelected(updated);
  }

  async function exportCsv() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/admin/leads/export`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lead</h1>
        <Button variant="outline" onClick={exportCsv}>Ekspor CSV</Button>
      </div>

      <div className="flex gap-2 mb-4">
        {['', 'new', 'contacted', 'qualified', 'converted', 'rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${filter === s ? 'bg-blue-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {statusLabels[s] ?? s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          {leads.map((lead) => (
            <button key={lead.id} onClick={() => setSelected(lead)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${selected?.id === lead.id ? 'border-blue-900 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'} ${!lead.isRead ? 'border-l-4 border-l-blue-600' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">{lead.name}</div>
                  <div className="text-sm text-gray-500">{lead.email}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${lead.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {statusLabels[lead.status] ?? lead.status}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-400">{lead.formType} · {formatDate(lead.createdAt)}</div>
            </button>
          ))}
          {leads.length === 0 && <p className="text-gray-500 text-center py-8">Tidak ada lead ditemukan</p>}
        </div>

        {selected && (
          <Card>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selected.name}</h2>
                <p className="text-sm text-gray-500">{selected.email} · {selected.phone}</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="font-medium">Subjek:</span> {selected.subject}</div>
              <div><span className="font-medium">Tipe:</span> {selected.formType}</div>
              <div className="p-3 bg-gray-50 rounded-lg">{selected.message}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['new', 'contacted', 'qualified', 'converted', 'rejected'].map((s) => (
                <button key={s} onClick={() => updateStatus(selected.id, s)}
                  className={`px-3 py-1 rounded text-xs font-medium ${selected.status === s ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {statusLabels[s] ?? s}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input placeholder="Tambah catatan..." value={note} onChange={(e) => setNote(e.target.value)} className="flex-1" />
              <Button size="sm" onClick={() => addNote(selected.id)}>Tambah</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
