import { getTranslations, setRequestLocale } from 'next-intl/server';
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages' });
  return buildMetadata({
    title: t('testimonials.metaTitle'),
    description: t('testimonials.metaDescription'),
    path: '/testimonials',
    locale,
  });
}

async function getTestimonials() {
  return fetchPublicApiList<Testimonial>('/testimonials', 60);
}

export default async function TestimonialsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [testimonials, t] = await Promise.all([
    getTestimonials(),
    getTranslations({ locale, namespace: 'pages' }),
  ]);

  return (
    <PublicPageShell>
      <PageIntro
        kicker={t('testimonials.kicker')}
        title={t('testimonials.title')}
        description={t('testimonials.description')}
      />

      {testimonials.length === 0 ? (
        <SaasEmptyState
          description={t('testimonials.empty')}
          actions={
            <>
              <Button href="/products" variant="outline">
                {t('testimonials.emptyProducts')}
              </Button>
              <Button href="/contact">{t('testimonials.emptyContact')}</Button>
            </>
          }
        />
      ) : (
        <>
          <div className="mx-auto mb-16 max-w-3xl">
            <TestimonialCarousel testimonials={testimonials} />
          </div>
          <div className="saas-card-grid lg-3 mb-16">
            {testimonials.map((item) => (
              <TestimonialCard key={item.id} testimonial={item} />
            ))}
          </div>
        </>
      )}

      <PageEndCta />
    </PublicPageShell>
  );
}
