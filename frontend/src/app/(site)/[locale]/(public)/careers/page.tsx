import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { MapPin, Clock, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { fetchPublicApiList } from '@/lib/server-api';
import type { Career } from '@/types';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';
import { SaasEmptyState } from '@/components/layout/SaasEmptyState';
import { Button } from '@/components/ui/Button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages' });
  return buildMetadata({
    title: t('careers.metaTitle'),
    description: t('careers.metaDescription'),
    path: '/careers',
    locale,
  });
}

async function getCareers() {
  return fetchPublicApiList<Career>('/careers', 60);
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [careers, t] = await Promise.all([
    getCareers(),
    getTranslations({ locale, namespace: 'pages' }),
  ]);

  return (
    <PublicPageShell>
        <PageIntro kicker={t('careers.kicker')} title={t('careers.title')} description={t('careers.description')} />

        <div className="space-y-4 max-w-3xl mx-auto">
          {careers.map((job) => (
            <Card key={job.id} hover>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    {job.department && (
                      <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" aria-hidden="true" />{job.department}</span>
                    )}
                    {job.location && (
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden="true" />{job.location}</span>
                    )}
                    {job.type && (
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" aria-hidden="true" />{job.type}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{job.description}</p>
                </div>
                <Link
                  href={`/contact?subject=${encodeURIComponent(t('careers.applySubject', { title: job.title }))}`}
                  className="shrink-0 border border-blue-900 bg-blue-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
                >
                  {t('careers.apply')}
                </Link>
              </div>
            </Card>
          ))}

          {careers.length === 0 && (
            <SaasEmptyState
              description={t('careers.empty')}
              actions={
                <Button href={`/contact?subject=${encodeURIComponent(t('careers.kicker'))}`}>
                  {t('careers.emptyAction')}
                </Button>
              }
            />
          )}
        </div>
        <PageEndCta />
    </PublicPageShell>
  );
}
