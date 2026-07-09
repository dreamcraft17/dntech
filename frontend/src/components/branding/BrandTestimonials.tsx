import { Card } from '@/components/ui/Card';
import type { Testimonial } from '@/types';

interface BrandTestimonialsProps {
  testimonials: Testimonial[];
}

export function BrandTestimonials({ testimonials }: BrandTestimonialsProps) {
  if (!testimonials.length) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Apa Kata Klien</h2>
          <p className="mt-2 text-gray-600">Social proof dari partner yang sudah bekerja sama dengan DN Tech.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {testimonials.slice(0, 3).map((testimonial) => (
            <Card key={testimonial.id} className="h-full border-l-4 border-l-teal-600">
              <p className="italic text-gray-900">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="mt-4">
                <p className="font-semibold text-gray-900">{testimonial.clientName}</p>
                <p className="text-sm text-gray-600">
                  {[testimonial.position, testimonial.company].filter(Boolean).join(', ')}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
