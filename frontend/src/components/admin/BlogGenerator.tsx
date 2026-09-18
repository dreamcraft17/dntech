'use client';

import { useState } from 'react';
import { WandSparkles, X } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setError('');
    setLoading(true);
    try {
      const draft = await apiFetch<Omit<GeneratedBlogDraft, 'status'>>('/admin/blog/generate', {
        method: 'POST',
        body: JSON.stringify({ topic, audience, tone, keywords }),
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
        <WandSparkles className="h-4 w-4" /> Buat dengan Gemini
      </Button>

      {open && (
        <Card className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[90vh] max-w-xl -translate-y-1/2 overflow-y-auto shadow-2xl sm:inset-x-auto sm:w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Buat draft artikel</h2>
              <p className="mt-1 text-sm text-gray-600">Gemini akan mengisi form artikel. Review sebelum disimpan atau diterbitkan.</p>
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
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="button" onClick={generate} loading={loading} disabled={!topic.trim()}>Generate Draft</Button>
          </div>
        </Card>
      )}
    </>
  );
}
