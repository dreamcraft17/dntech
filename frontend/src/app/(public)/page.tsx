import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { buildMetadata, PAGE_SEO } from '@/lib/seo';
import { asArray } from '@/lib/api';
import { getPublicSettings } from '@/lib/settings';
import { estimateReadTime, formatReadTime } from '@/lib/read-time';
import type { Service, BlogPost } from '@/types';
import type { Metadata } from 'next';
import { HeroBrand } from '@/components/layout/HeroBrand';
import { BrandStats } from '@/components/branding/BrandStats';
import { BrandStory } from '@/components/branding/BrandStory';
import { CoreValues } from '@/components/branding/CoreValues';
import { CompetitiveAdvantages } from '@/components/branding/CompetitiveAdvantages';
import { BrandTestimonials } from '@/components/branding/BrandTestimonials';
import { TeamSpotlightSection } from '@/components/branding/TeamSpotlightSection';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.home.title,
  description: PAGE_SEO.home.description,
  path: '/',
  keywords: PAGE_SEO.home.keywords,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getHomeServices() {
  try {
    const res = await fetch(`${API_URL}/services?pageSize=6`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return asArray<Service>((await res.json()).data).slice(0, 6);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [services, settings] = await Promise.all([
    getHomeServices(),
    getPublicSettings(),
  ]);
  const tagline = settings.tagline || settings.companyName || 'DN Tech';
  const heroDescription = settings.heroDescription as string | undefined;

  return (
    <>
      {/* Hero — solid color, no gradient */}
      <section className="bg-blue-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <HeroBrand tagline={tagline} description={heroDescription} />
          <div className="mt-8 flex max-w-3xl flex-wrap gap-4">
            <Button href="/contact" size="lg" variant="inverse">
              Konsultasi Gratis <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/services" size="lg" variant="outline-on-dark">
              Lihat Layanan
            </Button>
          </div>
        </div>
      </section>

      <BrandStats />
      <BrandStory />
      <CoreValues />
      <CompetitiveAdvantages />

      {/* Services Overview */}
      {services.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Layanan Kami</h2>
              <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
                Solusi pengembangan software dan konsultasi teknologi untuk startup & UMKM di Indonesia
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Link key={service.id} href={`/services/${service.slug}`}>
                  <Card hover className="h-full">
                    <div className="h-12 w-12 rounded-lg bg-blue-900/10 flex items-center justify-center mb-4">
                      <CheckCircle className="h-6 w-6 text-blue-900" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{service.description}</p>
                    <span className="mt-4 inline-flex items-center text-sm text-blue-900 font-medium">
                      Pelajari lebih lanjut <ArrowRight className="h-4 w-4 ml-1" />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button href="/services" variant="outline">
                Lihat Semua Layanan
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Blog Preview */}
      <Suspense fallback={<BlogPreviewSkeleton />}>
        <BlogPreviewSection />
      </Suspense>

      <TeamSpotlightSection />
      <BrandTestimonials />

      {/* Newsletter */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="mx-auto max-w-md px-4">
          <Card>
            <NewsletterForm />
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Siap mengembangkan proyek Anda?</h2>
          <p className="mt-4 text-blue-100 max-w-2xl mx-auto">
            Ceritakan kebutuhan Anda — tim kami akan merespons dalam 24 jam.
          </p>
          <div className="mt-8">
            <Button href="/contact" size="lg" variant="inverse">
              Konsultasi Gratis
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

async function getBlogPreview() {
  try {
    const res = await fetch(`${API_URL}/blog?pageSize=4`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return asArray<BlogPost>((await res.json()).data).slice(0, 4);
  } catch {
    return [];
  }
}

async function BlogPreviewSection() {
  const blogPosts = await getBlogPreview();
  if (!blogPosts.length) return null;

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Wawasan Terbaru</h2>
            <p className="mt-2 text-gray-600">Artikel teknologi untuk founder & tim produk</p>
          </div>
          <Link href="/blog" className="text-blue-900 font-medium hover:underline hidden sm:block">Lihat semua</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {blogPosts.map((post) => {
            const readMin = estimateReadTime(post.content || post.excerpt);
            return (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card hover className="h-full">
                  {post.category && (
                    <div className="text-xs text-teal-600 font-medium mb-2">{post.category}</div>
                  )}
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                  <p className="mt-3 text-xs text-gray-500">{formatReadTime(readMin)}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BlogPreviewSkeleton() {
  return (
    <section className="py-16 bg-white" aria-hidden="true">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 h-16 max-w-md rounded-lg bg-gray-100 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-lg border border-gray-200 bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

