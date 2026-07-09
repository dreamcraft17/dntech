'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
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
  comingSoonMessage: string;
}

export function HomeTestimonials({ testimonials, comingSoonMessage }: HomeTestimonialsProps) {
  const [current, setCurrent] = useState(0);

  if (!testimonials.length) {
    return (
      <section className="bg-gray-50 py-16" id="testimonials">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading title="Apa Kata Klien Kami" />
          <Card>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
              Coming Soon
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">{comingSoonMessage}</p>
            <div className="mt-6">
              <Button href="/contact">Konsultasi Gratis</Button>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  const item = testimonials[current];

  return (
    <section className="bg-gray-50 py-16" id="testimonials">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Apa Kata Klien Kami" />
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
          <Link href="/contact" className="text-sm font-medium text-blue-900 hover:underline">
            Hubungi kami untuk jadi founding client →
          </Link>
        </div>
      </div>
    </section>
  );
}
