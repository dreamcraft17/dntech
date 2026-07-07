'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Item { id: string; title: string; slug?: string; status?: string; clientName?: string; category?: string; [key: string]: unknown }

export default function AdminCrudPage({
  title, endpoint, fields, defaultItem,
}: {
  title: string;
  endpoint: string;
  fields: { key: string; label: string; type?: 'text' | 'textarea' | 'select' | 'number'; options?: { value: string; label: string }[]; required?: boolean }[];
  defaultItem: Record<string, unknown>;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await apiFetch<Item[]>(`/admin/${endpoint}`);
    setItems(data);
  }

  useEffect(() => { load().catch(console.error); }, [endpoint]);

  async function save() {
    if (!editing) return;
    setLoading(true);
    try {
      if (editing.id) {
        await apiFetch(`/admin/${endpoint}/${editing.id}`, { method: 'PATCH', body: JSON.stringify(editing) });
      } else {
        await apiFetch(`/admin/${endpoint}`, { method: 'POST', body: JSON.stringify(editing) });
      }
      setEditing(null);
      load();
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this item?')) return;
    await apiFetch(`/admin/${endpoint}/${id}`, { method: 'DELETE' });
    load();
  }

  const displayKey = fields[0]?.key || 'title';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <Button onClick={() => setEditing({ ...defaultItem })}><Plus className="h-4 w-4" /> Add</Button>
      </div>

      {editing && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">{editing.id ? 'Edit' : 'New'}</h2>
            <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((f) => (
              f.type === 'textarea' ? (
                <Textarea key={f.key} label={f.label} rows={4} value={String(editing[f.key] || '')}
                  onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} required={f.required} className="md:col-span-2" />
              ) : f.type === 'select' ? (
                <Select key={f.key} label={f.label} value={String(editing[f.key] || '')}
                  onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                  options={f.options || []} />
              ) : (
                <Input key={f.key} label={f.label} type={f.type === 'number' ? 'number' : 'text'}
                  value={String(editing[f.key] ?? '')} onChange={(e) => setEditing({ ...editing, [f.key]: f.type === 'number' ? parseInt(e.target.value) : e.target.value })}
                  required={f.required} />
              )
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={save} loading={loading}>Save</Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">{fields[0]?.label}</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{String(item[displayKey] || item.title || item.clientName || item.question || item.name)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{String(item.status || item.isApproved ? 'approved' : 'pending')}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing({ ...defaultItem, ...item })} className="p-1 text-slate-400 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(item.id)} className="p-1 text-slate-400 hover:text-red-600 ml-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-center text-slate-500 py-8">No items yet</p>}
      </div>
    </div>
  );
}
