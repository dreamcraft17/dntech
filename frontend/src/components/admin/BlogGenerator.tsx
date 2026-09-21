'use client';

import { useState } from 'react';
import { Image as ImageIcon, WandSparkles, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';

export interface GeneratedBlogDraft {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  status: 'draft';
  featuredImageId: string;
  featuredImageUrl: string;
  aiProvider: 'openai' | 'gemini';
  imageProvider: 'openai' | 'gemini' | null;
}

interface BlogGeneratorProps {
  onGenerated: (draft: GeneratedBlogDraft) => void;
}

export function BlogGenerator({ onGenerated }: BlogGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('jelas, hangat, praktis');
  const [keywords, setKeywords] = useState('');
  const [generateImage, setGenerateImage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setError('');
    setLoading(true);
    try {
      const draft = await apiFetch<Omit<GeneratedBlogDraft, 'status'>>('/admin/blog/generate', {
        method: 'POST',
        body: JSON.stringify({ topic, audience, tone, keywords, generateImage }),
      });
      onGenerated({ ...draft, status: 'draft' });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat draft');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        <WandSparkles className="h-4 w-4" /> Buat dengan OpenAI
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-gray-900/40" aria-hidden="true" />
          <Card className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Buat draft artikel</h2>
              <p className="mt-1 text-sm text-gray-600">OpenAI digunakan sebagai provider utama; Gemini menjadi fallback. Review sebelum disimpan atau diterbitkan.</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded p-2 text-gray-500 hover:bg-gray-100" aria-label="Tutup generator">
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && <Alert variant="error" className="mt-4">{error}</Alert>}

          <div className="mt-5 space-y-4">
            <Textarea label="Topik artikel" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Contoh: Cara memilih software HRIS untuk bisnis multi-cabang" required rows={3} />
            <Input label="Target pembaca" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Contoh: HR manager dan pemilik bisnis retail" />
            <Input label="Gaya bahasa" value={tone} onChange={(e) => setTone(e.target.value)} />
            <Input label="Keyword SEO" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Pisahkan dengan koma" />
            <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              <input type="checkbox" checked={generateImage} onChange={(e) => setGenerateImage(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-900" />
              <span><span className="flex items-center gap-1 font-medium text-gray-900"><ImageIcon className="h-4 w-4" /> Buat gambar cover dengan AI</span><span className="mt-1 block text-xs text-gray-500">Mencoba OpenAI terlebih dahulu, lalu Gemini jika tersedia. Gambar bersifat opsional.</span></span>
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="button" onClick={generate} loading={loading} disabled={!topic.trim()}>Generate Draft</Button>
          </div>
          </Card>
        </>
      )}
    </>
  );
}
