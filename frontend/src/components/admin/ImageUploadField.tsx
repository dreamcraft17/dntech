'use client';

import { useId, useRef, useState } from 'react';
import { Sparkles, UploadCloud, X } from 'lucide-react';
import { apiUpload, getUploadUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

interface MediaUploadResult {
  id: string;
  url: string;
}

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onUploaded?: (media: MediaUploadResult) => void;
  allowUrl?: boolean;
  className?: string;
  onGenerate?: () => void;
  generating?: boolean;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  onUploaded,
  allowUrl = true,
  className,
  onGenerate,
  generating = false,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const media = await apiUpload<MediaUploadResult>('/admin/media', file);
      if (onUploaded) onUploaded(media);
      else onChange(media.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gagal');
    } finally {
      setUploading(false);
    }
  }

  const previewSrc = value ? (value.startsWith('http') ? value : getUploadUrl(value)) : null;

  return (
    <div className={cn('space-y-1', className)}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-800">{label}</label>

      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border border-dashed p-3 transition-colors',
          dragOver ? 'border-blue-900 bg-blue-50' : 'border-gray-300'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt="" className="h-14 w-14 rounded-md object-cover border border-gray-200" />
        ) : (
          <div className="h-14 w-14 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center">
            <UploadCloud className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {allowUrl ? (
            <input
              id={inputId}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="URL gambar atau upload file"
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20"
            />
          ) : (
            <p id={inputId} className="text-sm text-gray-600">
              {value ? 'Gambar sudah dipilih' : 'Belum ada gambar'}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">Drag &amp; drop gambar ke sini, atau</p>
        </div>

        <div className="flex items-center gap-1">
          {onGenerate && (
            <button
              type="button"
              onClick={onGenerate}
              disabled={uploading || generating}
              className="inline-flex items-center gap-1 rounded-md border border-teal-600 px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {generating ? 'Membuat…' : 'Generate dengan Gemini'}
            </button>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || generating}
            className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? 'Mengunggah…' : 'Pilih File'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="rounded-md p-1.5 text-gray-400 hover:text-red-600"
              aria-label={`Hapus ${label}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}
