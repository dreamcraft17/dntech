'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';

type BrandingForm = {
  tagline: string;
  story: string;
  mission: string;
  values: string;
  advantages: string;
  stats: string;
};

export default function BrandingAdminPage() {
  const [form, setForm] = useState<BrandingForm>({
    tagline: '',
    story: '',
    mission: '',
    values: '[]',
    advantages: '[]',
    stats: '[]',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; variant: 'success' | 'error' }>({
    open: false,
    message: '',
    variant: 'success',
  });

  useEffect(() => {
    apiFetch<Record<string, unknown>>('/admin/settings')
      .then((settings) => {
        const about = (settings.aboutContent || {}) as Record<string, unknown>;
        setForm({
          tagline: String(settings.tagline || ''),
          story: String(about.story || ''),
          mission: String(about.mission || ''),
          values: JSON.stringify(about.values || [], null, 2),
          advantages: JSON.stringify(settings.trustBadges || [], null, 2),
          stats: JSON.stringify(settings.homeStats || [], null, 2),
        });
      })
      .catch(() => {
        setToast({ open: true, message: 'Gagal memuat data branding', variant: 'error' });
      });
  }, []);

  async function saveBranding() {
    setLoading(true);
    try {
      const values = JSON.parse(form.values || '[]');
      const trustBadges = JSON.parse(form.advantages || '[]');
      const homeStats = JSON.parse(form.stats || '[]');
      const aboutContent = {
        story: form.story,
        mission: form.mission,
        values,
      };

      await apiFetch('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          tagline: form.tagline,
          aboutContent,
          trustBadges,
          homeStats,
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
        </div>
      </Card>

      <Card title="Core Values (JSON)">
        <Textarea
          rows={10}
          className="font-mono text-xs"
          value={form.values}
          onChange={(e) => setForm((prev) => ({ ...prev, values: e.target.value }))}
          placeholder={'[\n  { "title": "Pragmatik", "description": "Solusi yang kerja", "iconName": "Wrench" }\n]'}
        />
      </Card>

      <Card title="Competitive Advantages / Why Choose Us (JSON)">
        <Textarea
          rows={8}
          className="font-mono text-xs"
          value={form.advantages}
          onChange={(e) => setForm((prev) => ({ ...prev, advantages: e.target.value }))}
          placeholder={'[\n  { "icon": "shield", "label": "Local + expert", "description": "Tim Indonesia paham bisnis lokal" }\n]'}
        />
      </Card>

      <Card title="Stats/Metrics (JSON)">
        <Textarea
          rows={8}
          className="font-mono text-xs"
          value={form.stats}
          onChange={(e) => setForm((prev) => ({ ...prev, stats: e.target.value }))}
          placeholder={'[\n  { "icon": "briefcase", "value": "50+", "label": "Proyek Selesai" }\n]'}
        />
      </Card>

      <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Team Spotlight dan Testimonials menggunakan data dari modul <Link href="/admin/team" className="text-blue-900 hover:underline">Tim</Link> dan{' '}
          <Link href="/admin/testimonials" className="text-blue-900 hover:underline">Testimoni</Link>.
        </p>
        <Button onClick={saveBranding} loading={loading}>Simpan Branding</Button>
      </div>
    </div>
  );
}
