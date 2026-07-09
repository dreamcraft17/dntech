'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';

type BrandingForm = {
  id?: string;
  tagline: string;
  story: string;
  mission: string;
  imageUrl: string;
};

export default function BrandingAdminPage() {
  const [form, setForm] = useState<BrandingForm>({
    tagline: '',
    story: '',
    mission: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; variant: 'success' | 'error' }>({
    open: false,
    message: '',
    variant: 'success',
  });

  useEffect(() => {
    apiFetch<Record<string, unknown> | null>('/admin/branding/content')
      .then((content) => {
        if (!content) return;
        setForm({
          id: String(content.id || ''),
          tagline: String(content.tagline || ''),
          story: String(content.story || ''),
          mission: String(content.mission || ''),
          imageUrl: String(content.imageUrl || ''),
        });
      })
      .catch(() => {
        setToast({ open: true, message: 'Gagal memuat data branding', variant: 'error' });
      });
  }, []);

  async function saveBranding() {
    setLoading(true);
    try {
      await apiFetch('/admin/branding/content', {
        method: 'PUT',
        body: JSON.stringify({
          tagline: form.tagline,
        story: form.story,
        mission: form.mission,
          imageUrl: form.imageUrl || undefined,
        }),
      });

      setToast({ open: true, message: 'Branding berhasil disimpan', variant: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan branding';
      setToast({ open: true, message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branding</h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola Brand Story, Core Values, Competitive Advantage, dan statistik beranda.
          </p>
        </div>
        <div className="flex gap-2">
          <Button href="/admin/team" variant="secondary">Kelola Tim</Button>
          <Button href="/admin/testimonials" variant="secondary">Kelola Testimoni</Button>
        </div>
      </div>

      <Card title="Brand Story">
        <div className="space-y-4">
          <Input
            label="Tagline Section"
            value={form.tagline}
            onChange={(e) => setForm((prev) => ({ ...prev, tagline: e.target.value }))}
            placeholder="Tentang DN Tech"
          />
          <Textarea
            label="Story (150-300 kata)"
            rows={7}
            value={form.story}
            onChange={(e) => setForm((prev) => ({ ...prev, story: e.target.value }))}
          />
          <Textarea
            label="Mission Statement"
            rows={3}
            value={form.mission}
            onChange={(e) => setForm((prev) => ({ ...prev, mission: e.target.value }))}
          />
          <Input
            label="Image URL (opsional)"
            value={form.imageUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
            placeholder="https://..."
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Button href="/admin/branding/values" variant="secondary">Kelola Values</Button>
        <Button href="/admin/branding/advantages" variant="secondary">Kelola Advantages</Button>
        <Button href="/admin/branding/stats" variant="secondary">Kelola Stats</Button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Team/testimonials ada endpoint branding khusus, dan juga tetap bisa dikelola dari{' '}
          <Link href="/admin/team" className="text-blue-900 hover:underline">/admin/team</Link> serta{' '}
          <Link href="/admin/testimonials" className="text-blue-900 hover:underline">/admin/testimonials</Link>.
        </p>
        <Button onClick={saveBranding} loading={loading}>Simpan Brand Content</Button>
      </div>
    </div>
  );
}
