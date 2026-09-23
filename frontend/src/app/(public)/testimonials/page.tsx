import { TestimonialCarousel } from '@/components/sliders/TestimonialCarousel';
import { TestimonialCard } from '@/components/cards/TestimonialCard';
import { Button } from '@/components/ui/Button';
import { fetchPublicApiList } from '@/lib/server-api';
import type { Testimonial } from '@/types';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { PageIntro } from '@/components/layout/PageIntro';

export const metadata: Metadata = buildMetadata({
  title: 'Testimoni',
  description: 'Testimoni klien DN Tech — dipublikasikan hanya setelah izin tertulis. Saat ini belum ada testimoni publik.',
  path: '/testimonials',
});

async function getTestimonials() {
  return fetchPublicApiList<Testimonial>('/testimonials', 60);
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageIntro kicker="Cerita pelanggan" title="Testimoni" description="Kami hanya mempublikasikan testimoni setelah izin tertulis. Saat ini belum ada testimoni publik — produk first-party kami ada di halaman Produk." />

        {testimonials.length === 0 && (
          <div className="border-y border-slate-300 py-16 mb-16">
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
          <div className="mt-16 border-y-2 border-blue-900 bg-blue-900 p-8 text-center">
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
