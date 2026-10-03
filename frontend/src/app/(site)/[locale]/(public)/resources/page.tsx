import { Download, FileText, ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { PageIntro } from '@/components/layout/PageIntro';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { getPublicSettings, getResources } from '@/lib/settings';
import { buildMetadata, getPageSeo } from '@/lib/seo';
import type { Metadata } from 'next';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo('resources', locale);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: '/resources',
    keywords: seo.keywords,
    locale,
  });
}

export default async function ResourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, t] = await Promise.all([
    getPublicSettings(),
    getTranslations({ locale, namespace: 'pages' }),
  ]);
  const resources = getResources(settings);

  return (
    <PublicPageShell>
        <PageIntro kicker={t('resources.kicker')} title={t('resources.title')} description={t('resources.description')} />

        {resources.length > 0 ? (
          <div className="mb-16 border-t border-slate-300">
            {resources.map((resource) => (
              <div key={resource.title} className="grid gap-5 border-b border-slate-300 py-7 sm:grid-cols-[2rem_0.65fr_1.35fr_auto] sm:items-start">
                <FileText className="mt-1 h-5 w-5 text-teal-700" aria-hidden="true" />
                <div>
                  {resource.type && <span className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{resource.type}</span>}
                  <h3 className="mt-1 font-semibold text-slate-950">{resource.title}</h3>
                </div>
                <p className="text-sm leading-6 text-slate-600">{resource.description}</p>
                <div>
                  {resource.downloadUrl ? <Button
                    href={resource.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" /> {t('resources.download')}
                  </Button> : <Button
                    href="/contact"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {t('resources.requestAccess')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-16 border-y border-slate-300 py-12">
            <p className="text-gray-600">{t('resources.empty')}</p>
            <Button href="/contact" variant="outline" className="mt-4">
              {t('resources.emptyAction')}
            </Button>
          </div>
        )}

        <div className="max-w-md border-t border-slate-300 pt-8">
            <NewsletterForm />
        </div>
        <PageEndCta />
    </PublicPageShell>
  );
}
