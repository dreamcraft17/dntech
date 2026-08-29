'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/homepage/SectionHeading';

interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  title?: string;
  company?: string;
}

interface HomeTestimonialsProps {
  testimonials: TestimonialItem[];
}

export function HomeTestimonials({ testimonials }: HomeTestimonialsProps) {
  const [current, setCurrent] = useState(0);

  if (!testimonials.length) return null;

  const item = testimonials[current];

  return (
    <section className="bg-gray-50 py-16" id="testimonials">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Testimoni" />
        <Card className="border-l-4 border-l-teal-600">
          <p className="italic leading-relaxed text-gray-900">&ldquo;{item.quote}&rdquo;</p>
          <p className="mt-4 font-semibold text-gray-900">— {item.author}</p>
          {(item.title || item.company) && (
            <p className="text-sm text-gray-600">
              {[item.title, item.company].filter(Boolean).join(', ')}
            </p>
          )}
        </Card>
        {testimonials.length > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setCurrent(idx)}
                className={`h-2 w-2 rounded-full ${idx === current ? 'bg-blue-900' : 'bg-gray-300'}`}
                aria-label={`Testimoni ${idx + 1}`}
              />
            ))}
          </div>
        )}
        <div className="mt-6 text-center">
          <Link href="/testimonials" className="text-sm font-medium text-blue-900 hover:underline">
            Lihat semua testimoni →
          </Link>
        </div>
      </div>
    </section>
  );
}
