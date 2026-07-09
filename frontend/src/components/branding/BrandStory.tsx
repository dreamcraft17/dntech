'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getApiUrl } from '@/lib/api';

interface BrandContent {
  id: string;
  tagline: string;
  story: string;
  mission: string;
  imageUrl?: string | null;
}

export function BrandStory() {
  const [content, setContent] = useState<BrandContent | null>(null);

  useEffect(() => {
    fetch(getApiUrl('/branding/content'))
      .then((res) => res.json())
      .then((json) => setContent(json.data || null))
      .catch(() => setContent(null));
  }, []);

  if (!content || (!content.story && !content.mission)) return null;

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {content.imageUrl ? (
            <Image
              src={content.imageUrl}
              alt="DN Tech"
              width={560}
              height={420}
              className="h-full w-full rounded-lg border border-gray-200 object-cover"
            />
          ) : (
            <Card className="h-full bg-blue-900/10 border-blue-100 flex items-center justify-center min-h-[280px]">
              <p className="text-blue-900 text-sm font-medium tracking-wide uppercase">
                DN Tech Indonesia
              </p>
            </Card>
          )}

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-900">
              {content.tagline || 'Tentang DN Tech'}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 lg:text-4xl">Tentang DN Tech</h2>
            {content.story && <p className="mt-4 text-gray-600 leading-relaxed whitespace-pre-line">{content.story}</p>}
            {content.mission && (
              <div className="mt-6 border-l-4 border-blue-900 bg-blue-900/5 p-4">
                <p className="text-blue-900 font-semibold">{content.mission}</p>
              </div>
            )}
            <div className="mt-6">
              <Button href="/contact">Mulai Sekarang</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
