'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Bot, EyeOff, Globe, Languages, Pencil, Plus, RefreshCw, Trash2, UserCheck, X } from 'lucide-react';
import type { Service } from '@/types';
import { ServiceGenerator, type GeneratedServiceDraft } from '@/components/admin/ServiceGenerator';

/** Admin UI stays Indonesian-only; it manages both published languages. */
const TARGET_LOCALE = 'en';

interface ServiceTranslation {
  locale: string;
  name?: string;
  slug?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  isMachine?: boolean;
}

const EMPTY_SERVICE_TRANSLATION: ServiceTranslation = {
  locale: TARGET_LOCALE,
  name: '',
  slug: '',
  description: '',
  seoTitle: '',
  seoDescription: '',
};

function toTranslationList(payload: unknown): ServiceTranslation[] {
  if (Array.isArray(payload)) return payload as ServiceTranslation[];
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.translations)) return record.translations as ServiceTranslation[];
  }
  return [];
}

function TranslationBadge({ translation }: { translation: ServiceTranslation | undefined }) {
  if (!translation) {
    return (
      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
        Belum ada terjemahan
      </span>
    );
  }
  return translation.isMachine ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
      <Bot className="h-3.5 w-3.5" /> Hasil AI — belum direview
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800">
      <UserCheck className="h-3.5 w-3.5" /> Disunting manusia
    </span>
  );
}

function ServiceTranslationsPanel({ services }: { services: Service[] }) {
  const [translations, setTranslations] = useState<Record<string, ServiceTranslation[]>>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ serviceId: string; serviceName: string; draft: ServiceTranslation } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadTranslations = useCallback(async (serviceId: string) => {
    const payload = await apiFetch<unknown>(`/admin/services/${serviceId}/translations`);
    setTranslations((prev) => ({ ...prev, [serviceId]: toTranslationList(payload) }));
  }, []);

  const loadAll = useCallback(async (list: Service[]) => {
    try {
      await Promise.all(list.map((service) => loadTranslations(service.id).catch(() => undefined)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar terjemahan');
    } finally {
      setInitialLoading(false);
    }
  }, [loadTranslations]);

  useEffect(() => {
    // loadAll resolves immediately (Promise.all([])) and still flips
    // initialLoading off via its own finally — no synchronous setState here.
    const timeoutId = setTimeout(() => {
      loadAll(services).catch(console.error);
    }, 0);
    return () => clearTimeout(timeoutId);
    // Re-runs when the service list length changes (create/delete), not on every rename.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services.length, loadAll]);

  function translationFor(serviceId: string) {
    return translations[serviceId]?.find((item) => item.locale === TARGET_LOCALE);
  }

  async function generate(service: Service) {
    if (!confirm(`Buat terjemahan Inggris untuk "${service.name}" dengan AI?`)) return;
    setError('');
    setBusyId(service.id);
    try {
      await apiFetch(`/admin/services/${service.id}/translations/${TARGET_LOCALE}/generate`, { method: 'POST' });
      await loadTranslations(service.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat terjemahan');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(service: Service) {
    if (!confirm(`Hapus terjemahan Inggris untuk "${service.name}"?`)) return;
    setError('');
    setBusyId(service.id);
    try {
      await apiFetch(`/admin/services/${service.id}/translations/${TARGET_LOCALE}`, { method: 'DELETE' });
      await loadTranslations(service.id);
      setEditing((current) => (current?.serviceId === service.id ? null : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus terjemahan');
    } finally {
      setBusyId(null);
    }
  }

  async function save() {
    if (!editing) return;
    setError('');
    setSaving(true);
    try {
      const { draft } = editing;
      await apiFetch(`/admin/services/${editing.serviceId}/translations/${TARGET_LOCALE}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: draft.name,
          slug: draft.slug,
          description: draft.description,
          seoTitle: draft.seoTitle,
          seoDescription: draft.seoDescription,
          // Saving from the editor means a human has reviewed this copy.
          isMachine: false,
        }),
      });
      await loadTranslations(editing.serviceId);
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan terjemahan');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(service: Service) {
    const existing = translationFor(service.id);
    setEditing({
      serviceId: service.id,
      serviceName: service.name,
      draft: { ...EMPTY_SERVICE_TRANSLATION, ...(existing ?? {}), locale: TARGET_LOCALE },
    });
  }

  function patchDraft(patch: Partial<ServiceTranslation>) {
    setEditing((current) => (current ? { ...current, draft: { ...current.draft, ...patch } } : current));
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Languages className="h-5 w-5 text-blue-900" /> Terjemahan Inggris
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Layanan ditulis dalam Bahasa Indonesia. Versi Inggris di sini yang tampil di rute /en.
          </p>
        </div>
        <Button variant="secondary" onClick={() => loadAll(services).catch(console.error)}>
          <RefreshCw className="h-4 w-4" /> Muat ulang
        </Button>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {editing && (
        <Card className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Terjemahan Inggris — {editing.serviceName}</h3>
              <p className="mt-1 text-xs text-gray-500">
                Menyimpan dari form ini menandai terjemahan sebagai sudah direview manusia.
              </p>
            </div>
            <button type="button" onClick={() => setEditing(null)} aria-label="Tutup editor terjemahan">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Nama (EN)" value={editing.draft.name ?? ''} onChange={(e) => patchDraft({ name: e.target.value })} required />
            <Input label="Slug (EN)" value={editing.draft.slug ?? ''} onChange={(e) => patchDraft({ slug: e.target.value })} />
            <Textarea label="Deskripsi (EN)" rows={5} className="md:col-span-2" value={editing.draft.description ?? ''} onChange={(e) => patchDraft({ description: e.target.value })} required />
            <Input label="Meta Title (EN)" value={editing.draft.seoTitle ?? ''} onChange={(e) => patchDraft({ seoTitle: e.target.value })} />
            <Textarea label="Meta Description (EN)" rows={3} value={editing.draft.seoDescription ?? ''} onChange={(e) => patchDraft({ seoDescription: e.target.value })} />
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Fitur layanan (EN) ikut diterjemahkan otomatis oleh AI dan belum bisa diedit manual di sini.
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={save} loading={saving}>Simpan terjemahan</Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>Batal</Button>
          </div>
        </Card>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Layanan</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status terjemahan EN</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => {
              const translation = translationFor(service.id);
              return (
                <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{service.name}</td>
                  <td className="px-4 py-3">
                    <TranslationBadge translation={translation} />
                    {translation?.slug && (
                      <div className="mt-1 text-xs text-gray-500">/en/services/{translation.slug}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!translation && (
                      <button
                        onClick={() => generate(service)}
                        disabled={busyId === service.id}
                        className="p-1 text-gray-400 hover:text-blue-900 disabled:opacity-50"
                        aria-label={`Buat terjemahan Inggris untuk ${service.name}`}
                        title="Buat dengan AI"
                      >
                        <Bot className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(service)}
                      className="ml-1 p-1 text-gray-400 hover:text-blue-900"
                      aria-label={`Ubah terjemahan Inggris untuk ${service.name}`}
                      title="Ubah terjemahan"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {translation && (
                      <button
                        onClick={() => remove(service)}
                        disabled={busyId === service.id}
                        className="ml-1 p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                        aria-label={`Hapus terjemahan Inggris untuk ${service.name}`}
                        title="Hapus terjemahan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {initialLoading && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-900 border-t-transparent" /> Memuat terjemahan...
          </div>
        )}
        {!initialLoading && services.length === 0 && (
          <p className="py-8 text-center text-gray-500">Belum ada layanan</p>
        )}
      </div>
    </section>
  );
}

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

      <ServiceTranslationsPanel services={items} />
    </div>
  );
}
