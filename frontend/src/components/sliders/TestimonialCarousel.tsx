'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/types';

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
}

export function TestimonialCarousel({ testimonials, autoPlay = true }: TestimonialCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!autoPlay || testimonials.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, [autoPlay, testimonials.length]);

  if (!testimonials.length) return null;

  const t = testimonials[current];

  return (
    <div className="relative">
      <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm min-h-[220px]">
        <div className="flex gap-1 mb-4">
          {Array.from({ length: t.rating || 5 }).map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <blockquote className="text-lg text-slate-700 italic leading-relaxed">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
        <div className="mt-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
            {t.clientName.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{t.clientName}</div>
            <div className="text-sm text-slate-500">{t.position || t.title}{t.company ? `, ${t.company}` : ''}</div>
          </div>
          {(t as Testimonial & { videoUrl?: string }).videoUrl && (
            <a href={(t as Testimonial & { videoUrl?: string }).videoUrl} target="_blank" rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-sm text-blue-600 hover:underline">
              <Play className="h-4 w-4" /> Tonton video
            </a>
          )}
        </div>
      </div>

      {testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)}
            className="p-2 rounded-full border border-slate-200 hover:bg-slate-50" aria-label="Sebelumnya">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={cn('h-2 rounded-full transition-all', i === current ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300')}
                aria-label={`Ke testimoni ${i + 1}`} />
            ))}
          </div>
          <button onClick={() => setCurrent((c) => (c + 1) % testimonials.length)}
            className="p-2 rounded-full border border-slate-200 hover:bg-slate-50" aria-label="Berikutnya">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
