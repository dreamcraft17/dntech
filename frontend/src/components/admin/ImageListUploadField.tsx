'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { apiUpload, getUploadUrl } from '@/lib/api';

interface MediaUploadResult {
  url: string;
}

interface ImageListUploadFieldProps {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
}

export function ImageListUploadField({ label, values, onChange }: ImageListUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) => apiUpload<MediaUploadResult>('/admin/media', file))
      );
      onChange([...values, ...uploaded.map((m) => m.url)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gagal');
    } finally {
      setUploading(false);
    }
  }

  function remove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-800">{label}</label>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {values.map((url, i) => (
          <div key={i} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url.startsWith('http') ? url : getUploadUrl(url)}
              alt=""
              className="h-20 w-full rounded-md object-cover border border-gray-200"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute -top-1.5 -right-1.5 rounded-full bg-white border border-gray-300 p-0.5 text-gray-500 hover:text-red-600 shadow-sm"
              aria-label={`Hapus screenshot ${i + 1}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <label className="flex h-20 w-full items-center justify-center rounded-md border border-dashed border-gray-300 text-gray-400 hover:border-blue-900 hover:text-blue-900 cursor-pointer">
          <Plus className="h-5 w-5" />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {uploading && <p className="text-xs text-gray-500">Mengunggah…</p>}
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}
