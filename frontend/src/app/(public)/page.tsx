import Link from 'next/link';
import { ArrowRight, CheckCircle, Star, Users, Briefcase, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrustBadges } from '@/components/layout/TrustBadges';
import { ClientLogos } from '@/components/layout/ClientLogos';
import { TestimonialCarousel } from '@/components/sliders/TestimonialCarousel';
import { CaseStudyCard } from '@/components/cards/CaseStudyCard';
import { ROICalculator } from '@/components/interactive/ROICalculator';
import { BookDemoSection } from '@/components/interactive/BookDemoSection';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { buildMetadata, PAGE_SEO } from '@/lib/seo';
import { asArray } from '@/lib/api';
import type { Service, BlogPost, Testimonial } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.home.title,
  description: PAGE_SEO.home.description,
  path: '/',
  keywords: PAGE_SEO.home.keywords,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface CaseStudy {
  slug: string;
  title: string;
  description?: string;
  clientName?: string;
  metrics?: Record<string, string>;
  industries?: string[];
}

async function getHomeData() {
  try {
    const [servicesRes, blogRes, testimonialsRes, settingsRes, caseStudiesRes] = await Promise.all([
      fetch(`${API_URL}/services`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/blog?pageSize=3`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/testimonials`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/settings`, { next: { revalidate: 300 } }),
      fetch(`${API_URL}/case-studies?pageSize=3`, { next: { revalidate: 60 } }),
    ]);

    const servicesJson = servicesRes.ok ? await servicesRes.json() : { data: [] };
    const blogJson = blogRes.ok ? await blogRes.json() : { data: [] };
    const testimonialsJson = testimonialsRes.ok ? await testimonialsRes.json() : { data: [] };
    const settingsJson = settingsRes.ok ? await settingsRes.json() : { data: {} };
    const caseStudiesJson = caseStudiesRes.ok ? await caseStudiesRes.json() : { data: [] };

    const services = asArray<Service>(servicesJson.data);
    const blogPosts = asArray<BlogPost>(blogJson.data);
    const testimonials = asArray<Testimonial>(testimonialsJson.data);
    const settings = settingsJson.data ?? {};
    const caseStudies = asArray<CaseStudy>(caseStudiesJson.data);

    return {
      services: services.slice(0, 4),
      blogPosts,
      testimonials: testimonials.slice(0, 5),
      settings,
      caseStudies,
    };
  } catch {
    return { services: [], blogPosts: [], testimonials: [], settings: {}, caseStudies: [] };
  }
}

export default async function HomePage() {
  const { services, blogPosts, testimonials, settings, caseStudies } = await getHomeData();
  const tagline = settings.tagline || 'Solusi Teknologi Terpercaya untuk Bisnis Anda';
  const trustBadges = settings.trustBadges as { icon?: string; label: string; description?: string }[] | undefined;
  const clientLogos = settings.clientLogos as { name: string; initial?: string }[] | undefined;

  const stats = [
    { icon: Briefcase, value: '100+', label: 'Projects Completed' },
    { icon: Users, value: '50+', label: 'Enterprise Clients' },
    { icon: Award, value: '15+', label: 'Industries Served' },
    { icon: Star, value: '4.9', label: 'Client Rating' },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {tagline}
            </h1>
            <p className="mt-6 text-lg text-blue-100 leading-relaxed">
              Kami membantu perusahaan Indonesia bertransformasi digital dengan solusi teknologi enterprise yang scalable, aman, dan inovatif.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  Request Free Demo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/case-studies">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Case Studies
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ClientLogos logos={clientLogos} />
      <TrustBadges badges={trustBadges} />

      {/* Stats */}
      <section className="bg-white py-12 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <Icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900">{value}</div>
                <div className="text-sm text-slate-600 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Layanan Kami</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Solusi teknologi end-to-end untuk kebutuhan bisnis modern
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link key={service.id} href={`/services/${service.slug}`}>
                <Card hover className="h-full">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{service.name}</h3>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-3">{service.description}</p>
                  <span className="mt-4 inline-flex items-center text-sm text-blue-600 font-medium">
                    Learn more <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10 flex flex-wrap gap-4 justify-center">
            <Link href="/services">
              <Button variant="outline">View All Services</Button>
            </Link>
            <Link href="/quiz">
              <Button variant="secondary">Not sure? Take our Quiz</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      {caseStudies.length > 0 && (
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Success Stories</h2>
                <p className="mt-2 text-slate-600">Real results from our enterprise clients</p>
              </div>
              <Link href="/case-studies" className="text-blue-600 font-medium hover:underline hidden sm:block">View all</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {caseStudies.map((item) => (
                <CaseStudyCard
                  key={item.slug}
                  slug={item.slug}
                  title={item.title}
                  description={item.description}
                  clientName={item.clientName}
                  metrics={item.metrics}
                  industries={item.industries}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900">What Our Clients Say</h2>
            </div>
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>
      )}

      {/* ROI Calculator */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Estimate Your Project</h2>
            <p className="mt-3 text-slate-600">Get a rough budget estimate in seconds</p>
          </div>
          <ROICalculator />
        </div>
      </section>

      {/* Blog */}
      {blogPosts.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900">Latest Insights</h2>
              <Link href="/blog" className="text-blue-600 font-medium hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card hover className="h-full">
                    <div className="text-xs text-blue-600 font-medium mb-2">{post.category}</div>
                    <h3 className="font-semibold text-slate-900">{post.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{post.excerpt}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Book Demo / Calendly */}
      <BookDemoSection calendlyUrl={settings.calendlyUrl as string | undefined} />

      {/* Newsletter */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-md px-4">
          <Card>
            <NewsletterForm />
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Transform Your Business?</h2>
          <p className="mt-4 text-blue-100 max-w-2xl mx-auto">
            Let&apos;s discuss how DN Tech can help you achieve your digital transformation goals.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                Request Free Demo
              </Button>
            </Link>
            <Link href="/resources">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Download Resources
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
