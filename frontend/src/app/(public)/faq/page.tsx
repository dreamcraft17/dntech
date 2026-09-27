'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/lib/api';
import type { Faq } from '@/types';
import Link from 'next/link';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell, SaasPanel } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    fetch(getApiUrl(`/faq?${params}`))
      .then((r) => r.json())
      .then((json) => setFaqs(json.data || []))
      .catch(() => setFaqs([]));
  }, [search, category]);

  const categories = [...new Set(faqs.map((f) => f.category))];

  return (
    <PublicPageShell width="3xl">
      <PageIntro
        kicker="Bantuan"
        title="Jawaban sebelum Anda memutuskan."
        description="Cari informasi tentang layanan, produk, proses kerja, pricing, dan cara memulai bersama DN Tech."
      />

      <SaasPanel className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Cari FAQ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-white py-3 pl-10 pr-4 text-sm focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory('')}
              className={cn(
                'min-h-9 rounded-[var(--radius-card)] border px-3 text-sm font-medium',
                !category ? 'border-blue-900 bg-blue-900 text-white' : 'border-[var(--border)] text-gray-600'
              )}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  'min-h-9 rounded-[var(--radius-card)] border px-3 text-sm font-medium',
                  category === cat ? 'border-blue-900 bg-blue-900 text-white' : 'border-[var(--border)] text-gray-600'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </SaasPanel>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <SaasPanel key={faq.id} className="!p-0 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={openId === faq.id}
            >
              <span className="font-semibold text-gray-900">{faq.question}</span>
              <ChevronDown className={cn('h-5 w-5 shrink-0 text-gray-500 transition-transform', openId === faq.id && 'rotate-180')} />
            </button>
            {openId === faq.id && (
              <div className="border-t border-[var(--border)] px-5 py-4 text-sm leading-relaxed text-gray-600">{faq.answer}</div>
            )}
          </SaasPanel>
        ))}
        {faqs.length === 0 && (
          <p className="py-8 text-center text-gray-500">
            Tidak ada FAQ ditemukan.{' '}
            <Link href="/contact" className="font-medium text-blue-900 hover:underline">
              Hubungi kami
            </Link>
          </p>
        )}
      </div>

      <PageEndCta />
    </PublicPageShell>
  );
}
