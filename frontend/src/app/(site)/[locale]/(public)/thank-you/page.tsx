import { CheckCircle, ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { ThankYouRedirect } from '@/components/interactive/ThankYouRedirect';
import { PublicPageShell, SaasPanel } from '@/components/layout/PublicPageShell';
import { buildMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages' });
  return buildMetadata({
    title: t('thankYou.metaTitle'),
    description: t('thankYou.metaDescription'),
    path: '/thank-you',
    noIndex: true,
    locale,
  });
}

export default async function ThankYouPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'pages' });

  return (
    <>
      <ThankYouRedirect />
      <PublicPageShell width="2xl" centered>
        <SaasPanel className="text-center">
          <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-600" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-gray-900">{t('thankYou.title')}</h1>
          <p className="mt-4 text-gray-600">
            {t.rich('thankYou.body', { strong: (chunks) => <strong>{chunks}</strong> })}
          </p>
          <p className="mt-2 text-sm text-gray-500">{t('thankYou.redirectNote')}</p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href="/blog" variant="outline">
              {t('thankYou.readArticles')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button href="/" variant="ghost">
              {t('thankYou.backHome')}
            </Button>
          </div>
        </SaasPanel>
      </PublicPageShell>
    </>
  );
}
