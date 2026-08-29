'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import type { SearchResult } from '@/types';

interface HeaderSearchProps {
  open: boolean;
  onClose: () => void;
}

export function HeaderSearch({ open, onClose }: HeaderSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchSearched, setSearchSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError('');
      setSearchSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError('');
        const controller = new AbortController();
        abortRef.current = controller;
        const results = await apiFetch<SearchResult[]>(`/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        setSearchResults(results);
        setSearchSearched(true);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setSearchError(err instanceof Error ? err.message : 'Pencarian gagal');
        setSearchResults([]);
        setSearchSearched(true);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open) return;
    setSearchQuery('');
    setSearchResults([]);
    setSearchLoading(false);
    setSearchError('');
    setSearchSearched(false);
  }, [open]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  if (!open) return null;

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto max-w-7xl">
        <input
          ref={inputRef}
          type="search"
          placeholder="Cari layanan, blog..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose();
          }}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
          aria-label="Cari di situs"
        />
        {searchResults.length > 0 && (
          <div className="mt-2 rounded-lg border border-gray-200 bg-white">
            {searchResults.map((result, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  router.push(result.url);
                  onClose();
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <div className="text-sm font-medium text-gray-900">{result.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {result.type} · {result.snippet}
                </div>
              </button>
            ))}
          </div>
        )}
        {(searchLoading ||
          searchError ||
          (searchSearched && searchQuery.length >= 2 && searchResults.length === 0)) && (
          <div className="mt-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            {searchLoading && 'Mencari...'}
            {!searchLoading && searchError && `Search error: ${searchError}`}
            {!searchLoading &&
              !searchError &&
              `Belum ada hasil untuk “${searchQuery}”. Coba kata lain seperti “software”, “web”, “produk”, atau “kontak”.`}
          </div>
        )}
      </div>
    </div>
  );
}
