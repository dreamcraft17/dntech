'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getApiUrl } from '@/lib/api';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  title: string;
  company?: string;
  logoUrl?: string | null;
}

export function BrandTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch(getApiUrl('/branding/testimonials'))
      .then((res) => res.json())
      .then((json) => setTestimonials(Array.isArray(json.data) ? json.data : []))
      .catch(() => setTestimonials([]));
  }, []);

  if (!testimonials.length) return null;
  const testimonial = testimonials[current];

  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Apa Kata Klien</h2>
          <p className="mt-2 text-gray-600">Social proof dari partner yang sudah bekerja sama dengan DN Tech.</p>
        </div>

        <Card className="h-full border-l-4 border-l-teal-600">
          {testimonial.logoUrl && (
            <Image
              src={testimonial.logoUrl}
              alt={testimonial.company || testimonial.author}
              width={100}
              height={40}
              className="mb-4 h-8 w-auto object-contain"
            />
          )}
          <p className="italic text-gray-900">&ldquo;{testimonial.quote}&rdquo;</p>
          <div className="mt-4">
            <p className="font-semibold text-gray-900">{testimonial.author}</p>
            <p className="text-sm text-gray-600">{testimonial.title}</p>
            {testimonial.company && <p className="text-sm text-gray-500">{testimonial.company}</p>}
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)}
            className="rounded-lg border border-gray-300 bg-white p-2 hover:border-blue-900"
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrent(idx)}
                className={`h-2 w-2 rounded-full ${idx === current ? 'bg-blue-900' : 'bg-gray-300'}`}
                aria-label={`Pilih testimoni ${idx + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent((c) => (c + 1) % testimonials.length)}
            className="rounded-lg border border-gray-300 bg-white p-2 hover:border-blue-900"
            aria-label="Berikutnya"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
