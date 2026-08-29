import { TestimonialCarousel } from '@/components/sliders/TestimonialCarousel';
import { TestimonialCard } from '@/components/cards/TestimonialCard';
import { Button } from '@/components/ui/Button';
import { fetchPublicApiList } from '@/lib/server-api';
import type { Testimonial } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Testimoni',
  description: 'Testimoni klien DN Tech — dipublikasikan hanya setelah izin tertulis. Saat ini belum ada testimoni publik.',
};

async function getTestimonials() {
  return fetchPublicApiList<Testimonial>('/testimonials', 60);
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Testimoni</h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Kami hanya mempublikasikan testimoni setelah izin tertulis. Saat ini belum ada testimoni publik — produk first-party kami ada di halaman Produk.
          </p>
        </div>

        {testimonials.length === 0 && (
          <div className="text-center py-16 rounded-lg border border-dashed border-gray-200 bg-gray-50 mb-16">
            <p className="text-gray-600">Belum ada testimoni yang dipublikasikan.</p>
            <Button href="/products" variant="secondary" className="mt-6 mr-3">
              Lihat Produk Kami
            </Button>
            <Button href="/contact" className="mt-6">
              Hubungi Kami
            </Button>
          </div>
        )}

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

        {testimonials.length > 0 && (
          <div className="mt-16 text-center p-8 rounded-2xl bg-blue-900">
            <h2 className="text-2xl font-bold text-white">Tertarik bekerja sama?</h2>
            <p className="mt-2 text-blue-100">Hubungi kami untuk konsultasi atau demo produk.</p>
            <Button href="/contact" size="lg" variant="inverse" className="mt-6">
              Hubungi Kami
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
