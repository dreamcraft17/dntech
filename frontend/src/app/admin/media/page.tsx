'use client';

import { useEffect, useState, useRef } from 'react';
import { apiFetch, getUploadUrl } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Upload, Trash2, Copy } from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  originalFilename?: string;
  url: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const data = await apiFetch<MediaItem[]>('/admin/media');
    setMedia(Array.isArray(data) ? data : []);
  }

  useEffect(() => { load().catch(console.error); }, []);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append('file', file);
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/admin/media`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
      }
      load();
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this file?')) return;
    await apiFetch(`/admin/media/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Media Library</h1>
        <Button onClick={() => fileRef.current?.click()} loading={uploading}>
          <Upload className="h-4 w-4" /> Upload
        </Button>
        <input ref={fileRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={(e) => upload(e.target.files)} />
      </div>

      <div
        className="mb-6 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
      >
        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-600">Drag & drop files here or click to upload</p>
        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP, GIF, PDF · Max 5MB</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item) => (
          <Card key={item.id} className="p-3">
            <div className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center mb-2 overflow-hidden">
              {item.mimeType?.startsWith('image/') ? (
                <img src={getUploadUrl(item.url)} alt={item.originalFilename || ''} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-slate-500">{item.mimeType}</span>
              )}
            </div>
            <p className="text-xs text-slate-600 truncate">{item.originalFilename || item.filename}</p>
            <div className="flex gap-1 mt-2">
              <button onClick={() => navigator.clipboard.writeText(getUploadUrl(item.url))}
                className="p-1 text-slate-400 hover:text-blue-600" title="Copy URL">
                <Copy className="h-3 w-3" />
              </button>
              <button onClick={() => remove(item.id)} className="p-1 text-slate-400 hover:text-red-600">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
