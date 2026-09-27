import { TestimonialCarousel } from '@/components/sliders/TestimonialCarousel';
import { TestimonialCard } from '@/components/cards/TestimonialCard';
import { Button } from '@/components/ui/Button';
import { fetchPublicApiList } from '@/lib/server-api';
import type { Testimonial } from '@/types';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';
import { SaasEmptyState } from '@/components/layout/SaasEmptyState';

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
    <PublicPageShell>
      <PageIntro
        kicker="Cerita pelanggan"
        title="Testimoni"
        description="Kami hanya mempublikasikan testimoni setelah izin tertulis."
      />

      {testimonials.length === 0 ? (
        <SaasEmptyState
          description="Belum ada testimoni publik. Lihat produk first-party kami sementara waktu."
          actions={
            <>
              <Button href="/products" variant="outline">
                Lihat Produk
              </Button>
              <Button href="/contact">Hubungi Kami</Button>
            </>
          }
        />
      ) : (
        <>
          <div className="mx-auto mb-16 max-w-3xl">
            <TestimonialCarousel testimonials={testimonials} />
          </div>
          <div className="saas-card-grid lg-3 mb-16">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </>
      )}

      <PageEndCta />
    </PublicPageShell>
  );
}
