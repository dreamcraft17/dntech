'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { EyeOff, Globe, Plus, Pencil, Trash2, X } from 'lucide-react';
import type { ReactNode } from 'react';

interface Item { id: string; title: string; slug?: string; status?: string; clientName?: string; category?: string; [key: string]: unknown }

type FieldDef = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'number' | 'json' | 'checkbox' | 'image';
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
};

export default function AdminCrudPage({
  title, endpoint, fields, defaultItem, renderExtraActions, publishable = false,
}: {
  title: string;
  endpoint: string;
  fields: FieldDef[];
  defaultItem: Record<string, unknown>;
  renderExtraActions?: (context: {
    setEditing: (item: Record<string, unknown>) => void;
    defaultItem: Record<string, unknown>;
  }) => ReactNode;
  publishable?: boolean;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Item[]>(`/admin/${endpoint}`);
      setItems(data);
    } finally {
      setInitialLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      load().catch(console.error);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [load]);

  function preparePayload(data: Record<string, unknown>) {
    const payload: Record<string, unknown> = {};

    for (const f of fields) {
      let val = data[f.key];

      if (f.type === 'json') {
        if (typeof val === 'string') {
          try {
            val = val ? JSON.parse(val) : {};
          } catch {
            /* keep string for server validation */
          }
        }
      } else if (f.type === 'number') {
        if (val === '' || val === null || val === undefined) {
          val = undefined;
        } else {
          const num = Number(val);
          val = Number.isNaN(num) ? undefined : num;
        }
      } else if (val === '') {
        val = undefined;
      }

      if (val !== undefined) {
        payload[f.key] = val;
      }
    }

    if (typeof data.isActive === 'boolean') {
      payload.isActive = data.isActive;
    }

    return payload;
  }

  async function save(publishAfterSave = false) {
    if (!editing) return;
    setLoading(true);
    try {
      const payload = preparePayload(editing);
      let saved: Item;
      if (editing.id) {
        saved = await apiFetch<Item>(`/admin/${endpoint}/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        saved = await apiFetch<Item>(`/admin/${endpoint}`, { method: 'POST', body: JSON.stringify(payload) });
      }
      if (publishAfterSave && saved.id) {
        await apiFetch(`/admin/${endpoint}/${saved.id}/publish`, { method: 'POST' });
      }
      setEditing(null);
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan';
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  async function publish(id: string) {
    if (!confirm('Terbitkan artikel ini sekarang?')) return;
    setPublishingId(id);
    try {
      await apiFetch(`/admin/${endpoint}/${id}/publish`, { method: 'POST' });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menerbitkan artikel');
    } finally {
      setPublishingId(null);
    }
  }

  async function unpublish(id: string) {
    if (!confirm('Sembunyikan artikel ini dari halaman publik?')) return;
    setPublishingId(id);
    try {
      await apiFetch(`/admin/${endpoint}/${id}/unpublish`, { method: 'POST' });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menyembunyikan artikel');
    } finally {
      setPublishingId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm('Hapus item ini?')) return;
    await apiFetch(`/admin/${endpoint}/${id}`, { method: 'DELETE' });
    load();
  }

  function startEdit(item: Item) {
    const data: Record<string, unknown> = { ...defaultItem, ...item };
    fields.filter((f) => f.type === 'json').forEach((f) => {
      if (data[f.key] && typeof data[f.key] === 'object') {
        data[f.key] = JSON.stringify(data[f.key], null, 2);
      }
    });
    fields.filter((f) => f.type === 'image').forEach((f) => {
      const media = item[`${f.key.replace(/Id$/, '')}`] as { url?: string } | null | undefined;
      data[`${f.key}Url`] = media?.url || '';
    });
    setEditing(data);
  }

  const displayKey = fields[0]?.key || 'title';
  const statusField = fields.find((f) => f.key === 'status' && f.type === 'select');
  const statusOptions = statusField?.options || [];
  const filteredItems = statusFilter === 'all' ? items : items.filter((item) => item.status === statusFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="flex flex-wrap gap-2">
          {renderExtraActions?.({ setEditing, defaultItem })}
          <Button onClick={() => setEditing({ ...defaultItem, ...(fields.filter((f) => f.type === 'json').reduce((acc, f) => ({ ...acc, [f.key]: '{}' }), {})) })}><Plus className="h-4 w-4" /> Tambah</Button>
        </div>
      </div>

      {statusOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Semua ({items.length})
          </button>
          {statusOptions.map((opt) => {
            const count = items.filter((item) => item.status === opt.value).length;
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {editing && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">{editing.id ? 'Ubah' : 'Baru'}</h2>
            <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((f) => {
              if (f.type === 'image') {
                const urlKey = `${f.key}Url`;
                return (
                  <ImageUploadField
                    key={f.key}
                    label={f.label}
                    value={String(editing[urlKey] ?? '')}
                    allowUrl={false}
                    onChange={() => setEditing({ ...editing, [f.key]: '', [urlKey]: '' })}
                    onUploaded={(media) => setEditing({
                      ...editing,
                      [f.key]: media.id,
                      [urlKey]: media.url,
                    })}
                    className="md:col-span-2"
                  />
                );
              }
              if (f.type === 'textarea' || f.type === 'json') {
                return (
                  <Textarea key={f.key} label={f.label} rows={f.type === 'json' ? 3 : 4}
                    value={String(editing[f.key] ?? (f.type === 'json' ? '{}' : ''))}
                    placeholder={f.placeholder}
                    onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                    required={f.required} className="md:col-span-2 font-mono text-xs" />
                );
              }
              if (f.type === 'select') {
                return (
                  <Select key={f.key} label={f.label} value={String(editing[f.key] || '')}
                    onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                    options={f.options || []} />
                );
              }
              if (f.type === 'checkbox') {
                return (
                  <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={Boolean(editing[f.key])}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-900" />
                    <span className="text-sm font-medium text-gray-700">{f.label}</span>
                  </label>
                );
              }
              return (
                <Input key={f.key} label={f.label} type={f.type === 'number' ? 'number' : 'text'}
                  value={String(editing[f.key] ?? '')}
                  onChange={(e) => setEditing({ ...editing, [f.key]: f.type === 'number' ? parseInt(e.target.value) : e.target.value })}
                  required={f.required} />
              );
            })}
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => save()} loading={loading}>Simpan</Button>
            {publishable && editing.status !== 'published' && (
              <Button onClick={() => save(true)} loading={loading} variant="secondary">
                <Globe className="h-4 w-4" /> Terbitkan
              </Button>
            )}
            <Button variant="secondary" onClick={() => setEditing(null)}>Batal</Button>
          </div>
        </Card>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{fields[0]?.label}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{String(item[displayKey] || item.title || item.clientName || item.question || item.name)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {String(item.status ?? (item.isApproved ? 'diterbitkan' : 'draf'))}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {publishable && item.status !== 'published' && (
                    <button
                      onClick={() => publish(item.id)}
                      disabled={publishingId === item.id}
                      className="p-1 text-gray-400 hover:text-green-700 disabled:opacity-50"
                      aria-label={`Terbitkan ${String(item[displayKey] || item.title || item.name)}`}
                      title="Terbitkan"
                    >
                      <Globe className="h-4 w-4" />
                    </button>
                  )}
                  {publishable && item.status === 'published' && (
                    <button
                      onClick={() => unpublish(item.id)}
                      disabled={publishingId === item.id}
                      className="p-1 text-gray-400 hover:text-amber-700 disabled:opacity-50"
                      aria-label={`Sembunyikan ${String(item[displayKey] || item.title || item.name)}`}
                      title="Sembunyikan dari publik"
                    >
                      <EyeOff className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => startEdit(item)} className="p-1 text-gray-400 hover:text-blue-900"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(item.id)} className="p-1 text-gray-400 hover:text-red-600 ml-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {initialLoading && <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-900 border-t-transparent" /> Memuat data...</div>}
        {!initialLoading && items.length === 0 && <p className="text-center text-gray-500 py-8">Belum ada item</p>}
        {!initialLoading && items.length > 0 && filteredItems.length === 0 && (
          <p className="text-center text-gray-500 py-8">Tidak ada item dengan status ini</p>
        )}
      </div>
    </div>
  );
}
