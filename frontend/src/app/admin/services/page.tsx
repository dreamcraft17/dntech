'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import type { Service } from '@/types';

const emptyForm = {
  name: '', description: '', category: '', status: 'draft' as string, displayOrder: 0,
  features: [] as { title: string; description?: string }[],
};

export default function AdminServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [editing, setEditing] = useState<(typeof emptyForm & { id?: string }) | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await apiFetch<Service[]>('/admin/services');
    setItems(data);
  }

  useEffect(() => { load().catch(console.error); }, []);

  async function save() {
    if (!editing) return;
    setLoading(true);
    try {
      if (editing.id) {
        await apiFetch(`/admin/services/${editing.id}`, { method: 'PATCH', body: JSON.stringify(editing) });
      } else {
        await apiFetch('/admin/services', { method: 'POST', body: JSON.stringify(editing) });
      }
      setEditing(null);
      load();
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this service?')) return;
    await apiFetch(`/admin/services/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Services</h1>
        <Button onClick={() => setEditing({ ...emptyForm })}><Plus className="h-4 w-4" /> Add Service</Button>
      </div>

      {editing && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">{editing.id ? 'Edit' : 'New'} Service</h2>
            <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
            <Input label="Category" value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
            <Select label="Status" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}
              options={[{ value: 'draft', label: 'Draft' }, { value: 'active', label: 'Active' }, { value: 'archived', label: 'Archived' }]} />
            <Input label="Display Order" type="number" value={editing.displayOrder} onChange={(e) => setEditing({ ...editing, displayOrder: parseInt(e.target.value) })} />
          </div>
          <Textarea label="Description" rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-4" required />
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
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                <td className="px-4 py-3 text-slate-600">{item.category}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {(item as Service & { status?: string }).status || 'active'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing({ ...emptyForm, ...item, id: item.id })} className="p-1 text-slate-400 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(item.id)} className="p-1 text-slate-400 hover:text-red-600 ml-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
