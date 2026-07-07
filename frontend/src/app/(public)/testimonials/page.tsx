import Link from 'next/link';
import { TestimonialCarousel } from '@/components/sliders/TestimonialCarousel';
import { TestimonialCard } from '@/components/cards/TestimonialCard';
import { Button } from '@/components/ui/Button';
import type { Testimonial } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Testimonials',
  description: 'Hear from enterprise clients who transformed their business with DN Tech.',
};

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
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Trusted by enterprise leaders across Indonesia. See what our partners say about working with DN Tech.
          </p>
        </div>

        {testimonials.length > 0 && (
          <div className="max-w-3xl mx-auto mb-16">
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        )}

        {testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        )}

        <div className="mt-16 text-center p-8 rounded-2xl bg-blue-600">
          <h2 className="text-2xl font-bold text-white">Join our satisfied clients</h2>
          <p className="mt-2 text-blue-100">Start your digital transformation journey today.</p>
          <Link href="/contact" className="inline-block mt-6">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">Request Free Demo</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
