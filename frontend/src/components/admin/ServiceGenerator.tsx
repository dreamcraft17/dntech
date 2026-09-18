'use client';

import { useState } from 'react';
import { WandSparkles, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';

export interface GeneratedServiceDraft {
  name: string;
  slug: string;
  description: string;
  category: string;
  features: { title: string; description?: string }[];
  seoTitle: string;
  seoDescription: string;
}

export function ServiceGenerator({ onGenerated }: { onGenerated: (draft: GeneratedServiceDraft) => void }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('jelas, hangat, profesional, praktis');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setError('');
    setLoading(true);
    try {
      const draft = await apiFetch<GeneratedServiceDraft>('/admin/services/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt, audience, tone, keywords }),
      });
      onGenerated(draft);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat draft layanan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        <WandSparkles className="h-4 w-4" /> Buat dengan Gemini
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-gray-900/40" aria-hidden="true" />
          <Card className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Buat draft layanan</h2>
                <p className="mt-1 text-sm text-gray-600">Tulis brief sesuai yang kamu mau. Gemini akan mengisi form layanan untuk direview.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded p-2 text-gray-500 hover:bg-gray-100" aria-label="Tutup generator">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && <Alert variant="error" className="mt-4">{error}</Alert>}

            <div className="mt-5 space-y-4">
              <Textarea
                label="Brief layanan"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Contoh: Layanan pembuatan aplikasi web custom untuk perusahaan distribusi yang ingin merapikan order, stok, dan laporan. Tekankan proses discovery, dashboard, integrasi API, dan pendampingan setelah rilis."
                required
                rows={5}
              />
              <Input label="Target pembaca" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Contoh: pemilik bisnis distribusi dan manajer operasional" />
              <Input label="Gaya bahasa" value={tone} onChange={(e) => setTone(e.target.value)} />
              <Input label="Keyword SEO" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Pisahkan dengan koma" />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="button" onClick={generate} loading={loading} disabled={!prompt.trim()}>Generate Draft</Button>
            </div>
          </Card>
        </>
      )}
    </>
  );
}
