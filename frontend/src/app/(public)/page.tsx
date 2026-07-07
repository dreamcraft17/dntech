import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrustBadges } from '@/components/layout/TrustBadges';
import { TeamSpotlight } from '@/components/layout/TeamSpotlight';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { buildMetadata, PAGE_SEO } from '@/lib/seo';
import { asArray } from '@/lib/api';
import { getHomeStats } from '@/lib/settings';
import { estimateReadTime, formatReadTime } from '@/lib/read-time';
import type { Service, BlogPost, TeamMember } from '@/types';
import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import { Briefcase, Users, Award, Star } from 'lucide-react';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.home.title,
  description: PAGE_SEO.home.description,
  path: '/',
  keywords: PAGE_SEO.home.keywords,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const STAT_ICONS: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  users: Users,
  award: Award,
  star: Star,
};

async function getHomeData() {
  try {
    const [servicesRes, blogRes, teamRes, settingsRes] = await Promise.all([
      fetch(`${API_URL}/services`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/blog?pageSize=4`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/team`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/settings`, { next: { revalidate: 300 } }),
    ]);

    const services = servicesRes.ok ? asArray<Service>((await servicesRes.json()).data) : [];
    const blogPosts = blogRes.ok ? asArray<BlogPost>((await blogRes.json()).data) : [];
    const team = teamRes.ok ? asArray<TeamMember>((await teamRes.json()).data) : [];
    const settings = settingsRes.ok ? (await settingsRes.json()).data ?? {} : {};

    return {
      services: services.slice(0, 6),
      blogPosts: blogPosts.slice(0, 4),
      team,
      settings,
    };
  } catch {
    return { services: [], blogPosts: [], team: [], settings: {} };
  }
}

export default async function HomePage() {
  const { services, blogPosts, team, settings } = await getHomeData();
  const tagline = settings.tagline || settings.companyName || 'DN Tech';
  const heroDescription = settings.heroDescription as string | undefined;
  const trustBadges = settings.trustBadges as { icon?: string; label: string; description?: string }[] | undefined;
  const stats = getHomeStats(settings);

  return (
    <>
      {/* Hero — solid color, no gradient */}
      <section className="bg-blue-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              {tagline}
            </h1>
            {heroDescription && (
              <p className="mt-6 text-lg text-blue-100 leading-relaxed">
                {heroDescription}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
                  Mulai Konsultasi Gratis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button size="lg" variant="secondary" className="border-white text-white hover:bg-blue-800 hover:text-white">
                  Lihat Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Real metrics only */}
      {stats.length > 0 && (
        <section className="bg-white py-12 border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = STAT_ICONS[stat.icon || 'briefcase'] || Briefcase;
                return (
                  <div key={`${stat.label}-${stat.value}`} className="text-center">
                    <Icon className="h-8 w-8 text-blue-900 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

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
              <Link href="/services">
                <Button variant="outline">Lihat Semua Layanan</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <TrustBadges badges={trustBadges} title="Mengapa Memilih Kami" />

      {/* Blog Preview */}
      {blogPosts.length > 0 && (
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
      )}

      {/* Team Preview */}
      {team.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <TeamSpotlight members={team} limit={4} />
          </div>
        </section>
      )}

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
            <Link href="/contact">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
                Mulai Konsultasi Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
