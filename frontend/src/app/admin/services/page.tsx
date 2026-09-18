'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { EyeOff, Globe, Plus, Pencil, Trash2, X } from 'lucide-react';
import type { Service } from '@/types';
import { ServiceGenerator, type GeneratedServiceDraft } from '@/components/admin/ServiceGenerator';

const emptyForm = {
  name: '', description: '', category: '', status: 'draft' as string, displayOrder: 0,
  seoTitle: '', seoDescription: '',
  features: [] as { title: string; description?: string }[],
};

export default function AdminServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [editing, setEditing] = useState<(typeof emptyForm & { id?: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await apiFetch<Service[]>('/admin/services');
    setItems(data);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      load().catch(console.error);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [load]);

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
    if (!confirm('Hapus layanan ini?')) return;
    await apiFetch(`/admin/services/${id}`, { method: 'DELETE' });
    load();
  }

  async function togglePublish(item: Service) {
    const isPublished = item.status === 'active';
    if (!confirm(isPublished ? 'Sembunyikan layanan ini dari halaman publik?' : 'Terbitkan layanan ini sekarang?')) return;
    setPublishingId(item.id);
    try {
      await apiFetch(`/admin/services/${item.id}/${isPublished ? 'unpublish' : 'publish'}`, { method: 'POST' });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal mengubah status layanan');
    } finally {
      setPublishingId(null);
    }
  }

  function applyGeneratedDraft(draft: GeneratedServiceDraft) {
    setEditing({ ...emptyForm, ...draft, status: 'draft', displayOrder: 0 });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Layanan</h1>
        <div className="flex flex-wrap gap-2">
          <ServiceGenerator onGenerated={applyGeneratedDraft} />
          <Button onClick={() => setEditing({ ...emptyForm })}><Plus className="h-4 w-4" /> Tambah Layanan</Button>
        </div>
      </div>

      {editing && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">{editing.id ? 'Ubah' : 'Baru'} Layanan</h2>
            <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
            <Input label="Kategori" value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
            <Select label="Status" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}
              options={[{ value: 'draft', label: 'Draf' }, { value: 'active', label: 'Aktif' }, { value: 'archived', label: 'Arsip' }]} />
            <p className="text-xs text-gray-500 md:col-span-2 -mt-2">
              Hanya layanan berstatus <strong>Aktif</strong> yang tampil di homepage dan halaman /services.
            </p>
            <Input label="Urutan Tampilan" type="number" value={editing.displayOrder} onChange={(e) => setEditing({ ...editing, displayOrder: parseInt(e.target.value) })} />
          </div>
          <Textarea label="Deskripsi" rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-4" required />
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Fitur / cakupan layanan</label>
              <button
                type="button"
                onClick={() => setEditing({ ...editing, features: [...editing.features, { title: '', description: '' }] })}
                className="text-sm font-medium text-blue-900 hover:underline"
              >
                + Tambah fitur
              </button>
            </div>
            <div className="space-y-3">
              {editing.features.map((feature, index) => (
                <div key={`${index}-${feature.title}`} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex gap-2">
                    <Input
                      label={`Fitur ${index + 1}`}
                      value={feature.title}
                      onChange={(e) => setEditing({ ...editing, features: editing.features.map((item, i) => i === index ? { ...item, title: e.target.value } : item) })}
                    />
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, features: editing.features.filter((_, i) => i !== index) })}
                      className="mt-7 rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Hapus fitur ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Textarea
                    label="Penjelasan"
                    rows={2}
                    value={feature.description || ''}
                    onChange={(e) => setEditing({ ...editing, features: editing.features.map((item, i) => i === index ? { ...item, description: e.target.value } : item) })}
                    className="mt-2"
                  />
                </div>
              ))}
              {editing.features.length === 0 && <p className="text-sm text-gray-500">Belum ada fitur. Tambahkan jika diperlukan.</p>}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Meta Title"
              value={editing.seoTitle || ''}
              onChange={(e) => setEditing({ ...editing, seoTitle: e.target.value })}
            />
            <Textarea
              label="Meta Description"
              rows={2}
              value={editing.seoDescription || ''}
              onChange={(e) => setEditing({ ...editing, seoDescription: e.target.value })}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={save} loading={loading}>Simpan</Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>Batal</Button>
          </div>
        </Card>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nama</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-gray-600">{item.category}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {(item as Service & { status?: string }).status || 'active'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => togglePublish(item)}
                    disabled={publishingId === item.id}
                    className={`p-1 disabled:opacity-50 ${item.status === 'active' ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'}`}
                    aria-label={item.status === 'active' ? `Sembunyikan ${item.name}` : `Terbitkan ${item.name}`}
                    title={item.status === 'active' ? 'Sembunyikan dari publik' : 'Terbitkan'}
                  >
                    {item.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setEditing({ ...emptyForm, ...item, id: item.id })} className="p-1 text-gray-400 hover:text-blue-900"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(item.id)} className="p-1 text-gray-400 hover:text-red-600 ml-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
