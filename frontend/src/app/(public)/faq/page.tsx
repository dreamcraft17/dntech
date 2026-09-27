'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/lib/api';
import type { Faq } from '@/types';
import Link from 'next/link';
import { PageIntro } from '@/components/layout/PageIntro';

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
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <PageIntro
          kicker="Bantuan"
          title="Jawaban sebelum Anda memutuskan."
          description="Cari informasi tentang layanan, produk, proses kerja, pricing, dan cara memulai bersama DN Tech."
        />

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Cari FAQ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setCategory('')}
              className={cn('border px-3 py-2 text-sm font-medium', !category ? 'border-blue-900 bg-blue-900 text-white' : 'border-slate-200 bg-white text-gray-600')}>
              Semua
            </button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={cn('border px-3 py-2 text-sm font-medium', category === cat ? 'border-blue-900 bg-blue-900 text-white' : 'border-slate-200 bg-white text-gray-600')}>
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} id={faq.id} className="overflow-hidden border border-slate-200 bg-white">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown className={cn('h-5 w-5 text-gray-400 shrink-0 transition-transform', openId === faq.id && 'rotate-180')} />
              </button>
              {openId === faq.id && (
                <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-gray-600">Tidak menemukan yang Anda cari?</p>
          <Link href="/contact" className="mt-2 inline-block text-blue-900 font-medium hover:underline">
            Hubungi kami langsung
          </Link>
        </div>
      </div>
    </div>
  );
}
