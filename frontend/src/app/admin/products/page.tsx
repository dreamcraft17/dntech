'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Toast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import type { Product, PricingTier, ProductFaqItem } from '@/types';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { ImageListUploadField } from '@/components/admin/ImageListUploadField';
import { PricingTiersEditor } from '@/components/admin/PricingTiersEditor';
import { FaqEditor } from '@/components/admin/FaqEditor';

const emptyForm = {
  name: '', slug: '', description: '', tagline: '', category: '', longFormContent: '',
  seoTitle: '', seoDescription: '', keywords: '', canonical: '',
  heroImage: '', heroAlt: '', logoUrl: '', screenshotUrls: [] as string[],
  primaryCta: '{}', secondaryCtas: '[]', demoUrl: '', pricingCalcUrl: '',
  pricingTiers: [] as PricingTier[], freemiumEnabled: false, freeLimit: '', trialDays: '',
  features: '[]', useCases: '[]', techStack: '[]',
  integrations: '[]', comparisonTable: '{}',
  testimonials: '[]', caseStudies: '[]', customerCount: '',
  roadmap: '[]', faq: [] as ProductFaqItem[],
  status: 'draft' as string, featured: false, launchStatus: '', displayOrder: 0, publishedAt: '',
};

type EditingForm = typeof emptyForm & { id?: string };

function parseJsonField<T>(raw: string, fieldLabel: string, fallback: T): T {
  try {
    return JSON.parse(raw || JSON.stringify(fallback)) as T;
  } catch {
    throw new Error(`Format JSON tidak valid pada "${fieldLabel}". Periksa tanda kutip, koma, dan kurung kurawal.`);
  }
}

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<EditingForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; variant: 'success' | 'error' }>({
    open: false, message: '', variant: 'success',
  });

  function showToast(message: string, variant: 'success' | 'error') {
    setToast({ open: true, message, variant });
  }

  const load = useCallback(async () => {
    const data = await apiFetch<Product[]>('/admin/products');
    setItems(data);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      load().catch(console.error);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [load]);

  function openCreate() {
    setError(null);
    setEditing({ ...emptyForm });
  }

  function openEdit(item: Product) {
    setError(null);
    setEditing({
      ...emptyForm,
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      tagline: item.tagline || '',
      category: item.category || '',
      longFormContent: item.longFormContent || '',
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || '',
      keywords: item.keywords || '',
      canonical: item.canonical || '',
      heroImage: item.heroImage || '',
      heroAlt: item.heroAlt || '',
      logoUrl: item.logoUrl || '',
      screenshotUrls: item.screenshotUrls || [],
      primaryCta: JSON.stringify(item.primaryCta || {}, null, 2),
      secondaryCtas: JSON.stringify(item.secondaryCtas || [], null, 2),
      demoUrl: item.demoUrl || '',
      pricingCalcUrl: item.pricingCalcUrl || '',
      pricingTiers: item.pricingTiers || [],
      freemiumEnabled: item.freemiumEnabled || false,
      freeLimit: item.freeLimit || '',
      trialDays: item.trialDays != null ? String(item.trialDays) : '',
      features: JSON.stringify(item.features || [], null, 2),
      useCases: JSON.stringify(item.useCases || [], null, 2),
      techStack: JSON.stringify(item.techStack || [], null, 2),
      integrations: JSON.stringify(item.integrations || [], null, 2),
      comparisonTable: JSON.stringify(item.comparisonTable || {}, null, 2),
      testimonials: JSON.stringify(item.testimonials || [], null, 2),
      caseStudies: JSON.stringify(item.caseStudies || [], null, 2),
      customerCount: item.customerCount || '',
      roadmap: JSON.stringify(item.roadmap || [], null, 2),
      faq: item.faq || [],
      status: item.status || 'draft',
      featured: item.featured || false,
      launchStatus: item.launchStatus || '',
      displayOrder: item.displayOrder || 0,
      publishedAt: item.publishedAt ? item.publishedAt.slice(0, 10) : '',
    });
  }

  async function save() {
    if (!editing) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: editing.name,
        slug: editing.slug || undefined,
        description: editing.description,
        tagline: editing.tagline || undefined,
        category: editing.category || undefined,
        longFormContent: editing.longFormContent || undefined,
        seoTitle: editing.seoTitle || undefined,
        seoDescription: editing.seoDescription || undefined,
        keywords: editing.keywords || undefined,
        canonical: editing.canonical || undefined,
        heroImage: editing.heroImage || undefined,
        heroAlt: editing.heroAlt || undefined,
        logoUrl: editing.logoUrl || undefined,
        screenshotUrls: editing.screenshotUrls,
        primaryCta: parseJsonField(editing.primaryCta, 'Primary CTA', {}),
        secondaryCtas: parseJsonField(editing.secondaryCtas, 'Secondary CTAs', []),
        demoUrl: editing.demoUrl || undefined,
        pricingCalcUrl: editing.pricingCalcUrl || undefined,
        pricingTiers: editing.pricingTiers,
        freemiumEnabled: editing.freemiumEnabled,
        freeLimit: editing.freeLimit || undefined,
        trialDays: editing.trialDays ? Number(editing.trialDays) : undefined,
        features: parseJsonField(editing.features, 'Fitur', []),
        useCases: parseJsonField(editing.useCases, 'Use Cases', []),
        techStack: parseJsonField(editing.techStack, 'Tech Stack', []),
        integrations: parseJsonField(editing.integrations, 'Integrasi', []),
        comparisonTable: parseJsonField(editing.comparisonTable, 'Tabel Perbandingan', {}),
        testimonials: parseJsonField(editing.testimonials, 'Testimoni', []),
        caseStudies: parseJsonField(editing.caseStudies, 'Studi Kasus', []),
        customerCount: editing.customerCount || undefined,
        roadmap: parseJsonField(editing.roadmap, 'Roadmap', []),
        faq: editing.faq,
        status: editing.status,
        featured: editing.featured,
        launchStatus: editing.launchStatus || undefined,
        displayOrder: Number(editing.displayOrder) || 0,
        publishedAt: editing.publishedAt || undefined,
      };

      if (editing.id) {
        await apiFetch(`/admin/products/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/admin/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      setEditing(null);
      showToast('Produk berhasil disimpan!', 'success');
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan produk';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Hapus produk ini?')) return;
    await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div>
      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Tambah Produk</Button>
      </div>

      {editing && (
        <div className="mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">{editing.id ? 'Ubah' : 'Baru'} Produk</h2>
            <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-gray-400" /></button>
          </div>

          <Card title="Info Dasar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nama" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
              <Input label="Slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="auto dari nama jika kosong" />
              <Input label="Tagline" value={editing.tagline} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} />
              <Input label="Kategori" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="HRIS" />
            </div>
            <Textarea label="Deskripsi" rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-4" required />
            <Textarea label="Konten Panjang (opsional)" rows={5} value={editing.longFormContent} onChange={(e) => setEditing({ ...editing, longFormContent: e.target.value })} className="mt-4" />
          </Card>

          <Card title="SEO">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Meta Title" value={editing.seoTitle} onChange={(e) => setEditing({ ...editing, seoTitle: e.target.value })} />
              <Input label="Keywords (comma-separated)" value={editing.keywords} onChange={(e) => setEditing({ ...editing, keywords: e.target.value })} />
              <Input label="Canonical URL" value={editing.canonical} onChange={(e) => setEditing({ ...editing, canonical: e.target.value })} />
            </div>
            <Textarea label="Meta Description" rows={2} value={editing.seoDescription} onChange={(e) => setEditing({ ...editing, seoDescription: e.target.value })} className="mt-4" />
          </Card>

          <Card title="Media & CTA">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUploadField label="Hero Image" value={editing.heroImage} onChange={(url) => setEditing({ ...editing, heroImage: url })} />
              <Input label="Hero Alt Text" value={editing.heroAlt} onChange={(e) => setEditing({ ...editing, heroAlt: e.target.value })} />
              <ImageUploadField label="Logo" value={editing.logoUrl} onChange={(url) => setEditing({ ...editing, logoUrl: url })} />
              <Input label="Demo URL (Calendly)" value={editing.demoUrl} onChange={(e) => setEditing({ ...editing, demoUrl: e.target.value })} />
              <Input label="Pricing Calculator URL" value={editing.pricingCalcUrl} onChange={(e) => setEditing({ ...editing, pricingCalcUrl: e.target.value })} />
            </div>
            <div className="mt-4">
              <ImageListUploadField label="Screenshots" values={editing.screenshotUrls} onChange={(urls) => setEditing({ ...editing, screenshotUrls: urls })} />
            </div>
            <Textarea label="Primary CTA (JSON)" rows={5} value={editing.primaryCta} onChange={(e) => setEditing({ ...editing, primaryCta: e.target.value })} className="mt-4 font-mono text-xs" placeholder={'{\n  "label": "Mulai Gratis",\n  "url": "https://...",\n  "type": "trial"\n}'} />
            <Textarea label="Secondary CTAs (JSON array)" rows={6} value={editing.secondaryCtas} onChange={(e) => setEditing({ ...editing, secondaryCtas: e.target.value })} className="mt-4 font-mono text-xs" placeholder={'[\n  { "label": "Lihat Pricing", "url": "#pricing", "type": "link" }\n]'} />
          </Card>

          <Card title="Pricing">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-800">
                <input type="checkbox" checked={editing.freemiumEnabled} onChange={(e) => setEditing({ ...editing, freemiumEnabled: e.target.checked })} />
                Freemium diaktifkan
              </label>
              <Input label="Batas Gratis" value={editing.freeLimit} onChange={(e) => setEditing({ ...editing, freeLimit: e.target.value })} placeholder="100 employees" />
              <Input label="Trial (hari)" type="number" value={editing.trialDays} onChange={(e) => setEditing({ ...editing, trialDays: e.target.value })} />
            </div>
            <div className="mt-4">
              <PricingTiersEditor tiers={editing.pricingTiers} onChange={(tiers) => setEditing({ ...editing, pricingTiers: tiers })} />
            </div>
          </Card>

          <Card title="Fitur & Use Case">
            <Textarea label="Fitur (JSON array, flat atau per-kategori)" rows={10} value={editing.features} onChange={(e) => setEditing({ ...editing, features: e.target.value })} className="font-mono text-xs" placeholder={'[\n  { "category": "Core Payroll", "icon": "credit-card", "features": [{ "name": "...", "description": "..." }] }\n]'} />
            <Textarea label="Use Cases (JSON array)" rows={10} value={editing.useCases} onChange={(e) => setEditing({ ...editing, useCases: e.target.value })} className="mt-4 font-mono text-xs" placeholder={'[\n  { "id": "retail", "segment": "Retail & F&B", "description": "...", "uniqueFeatures": ["..."], "testimonial": { "quote": "...", "author": "..." }, "cta": { "label": "...", "url": "..." } }\n]'} />
            <Textarea label="Tech Stack (JSON array, opsional)" rows={3} value={editing.techStack} onChange={(e) => setEditing({ ...editing, techStack: e.target.value })} className="mt-4 font-mono text-xs" placeholder={'["React", "Node.js"]'} />
          </Card>

          <Card title="Integrasi & Perbandingan">
            <Textarea label="Integrasi (JSON array)" rows={8} value={editing.integrations} onChange={(e) => setEditing({ ...editing, integrations: e.target.value })} className="font-mono text-xs" placeholder={'[\n  { "name": "Xendit", "category": "Payments", "description": "...", "status": "available" }\n]'} />
            <Textarea label="Tabel Perbandingan Kompetitor (JSON)" rows={10} value={editing.comparisonTable} onChange={(e) => setEditing({ ...editing, comparisonTable: e.target.value })} className="mt-4 font-mono text-xs" placeholder={'{\n  "competitors": ["dnPeople", "Talenta"],\n  "rows": [{ "feature": "Harga", "dnpeople": "✅", "talenta": "❌" }]\n}'} />
          </Card>

          <Card title="Sosial Proof">
            <Input label="Jumlah Customer" value={editing.customerCount} onChange={(e) => setEditing({ ...editing, customerCount: e.target.value })} placeholder="500+" />
            <Textarea label="Testimoni (JSON array)" rows={10} value={editing.testimonials} onChange={(e) => setEditing({ ...editing, testimonials: e.target.value })} className="mt-4 font-mono text-xs" placeholder={'[\n  { "id": "t1", "quote": "...", "author": "...", "company": "...", "rating": 5 }\n]'} />
            <Textarea label="Studi Kasus (JSON array, opsional)" rows={4} value={editing.caseStudies} onChange={(e) => setEditing({ ...editing, caseStudies: e.target.value })} className="mt-4 font-mono text-xs" />
          </Card>

          <Card title="Roadmap & FAQ">
            <Textarea label="Roadmap (JSON array)" rows={10} value={editing.roadmap} onChange={(e) => setEditing({ ...editing, roadmap: e.target.value })} className="font-mono text-xs" placeholder={'[\n  { "quarter": "Q3 2026", "status": "launched", "features": [{ "name": "...", "description": "..." }] }\n]'} />
            <div className="mt-4">
              <FaqEditor items={editing.faq} onChange={(faq) => setEditing({ ...editing, faq })} />
            </div>
            <p className="mt-2 text-xs text-gray-500">Jika dikosongkan, halaman produk memakai FAQ global (<code>/faq</code>).</p>
          </Card>

          <Card title="Status & Publishing">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Status" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                options={[{ value: 'draft', label: 'Draf' }, { value: 'active', label: 'Aktif' }, { value: 'archived', label: 'Arsip' }]} />
              <Select label="Launch Status" value={editing.launchStatus} onChange={(e) => setEditing({ ...editing, launchStatus: e.target.value })}
                options={[{ value: '', label: '-' }, { value: 'launched', label: 'Launched' }, { value: 'beta', label: 'Beta' }, { value: 'coming_soon', label: 'Coming Soon' }]} />
              <Input label="Urutan Tampilan" type="number" value={editing.displayOrder} onChange={(e) => setEditing({ ...editing, displayOrder: parseInt(e.target.value) || 0 })} />
              <Input label="Tanggal Publish" type="date" value={editing.publishedAt} onChange={(e) => setEditing({ ...editing, publishedAt: e.target.value })} />
              <label className="flex items-center gap-2 text-sm text-gray-800">
                <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
                Featured (tampil menonjol di listing)
              </label>
            </div>
          </Card>

          <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            {error && (
              <p className="text-sm font-medium text-red-700" role="alert">{error}</p>
            )}
            <div className="flex gap-2">
              <Button onClick={save} loading={loading}>Simpan</Button>
              <Button variant="secondary" onClick={() => setEditing(null)}>Batal</Button>
            </div>
          </div>
        </div>
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
                <td className="px-4 py-3 font-medium text-gray-900">{item.name}{item.featured && <span className="ml-2 text-xs text-blue-900">★</span>}</td>
                <td className="px-4 py-3 text-gray-600">{item.category}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.status || 'active'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-blue-900"><Pencil className="h-4 w-4" /></button>
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
