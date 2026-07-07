import { Card } from '@/components/ui/Card';
import { Star } from 'lucide-react';
import type { Testimonial } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Testimonials' };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getTestimonials() {
  try {
    const res = await fetch(`${API_URL}/testimonials`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()).data as Testimonial[];
  } catch {
    return [];
  }
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900">Client Testimonials</h1>
          <p className="mt-4 text-slate-600">What our clients say about working with us</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.id}>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-600 italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {t.clientName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{t.clientName}</div>
                  <div className="text-sm text-slate-500">{t.position}, {t.company}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
