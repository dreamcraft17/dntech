import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MultiStepForm } from '@/components/forms/MultiStepForm';
import { CalendlyEmbed } from '@/components/interactive/CalendlyEmbed';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell, SaasPanel } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';
import { buildMetadata, getPageSeo } from '@/lib/seo';
import { getPublicSettings } from '@/lib/settings';
import { fetchPublicApiList } from '@/lib/server-api';
import type { Service } from '@/types';
import { Mail, MessageCircle, MapPin, Clock } from 'lucide-react';
import { resolveCompanyPhone, whatsAppUrl } from '@/lib/contact-links';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo('contact', locale);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: '/contact',
    keywords: seo.keywords,
    locale,
  });
}

async function getContactData() {
  const [settings, services] = await Promise.all([
    getPublicSettings(),
    fetchPublicApiList<Service>('/services', 60),
  ]);
  return { settings, services };
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { service } = await searchParams;
  const [{ settings, services }, t] = await Promise.all([
    getContactData(),
    getTranslations({ locale, namespace: 'pages' }),
  ]);
  const calendlyUrl = settings.calendlyUrl;

  const whatsapp = resolveCompanyPhone(settings.companyPhone);

  const contactItems = [
    settings.companyEmail
      ? { icon: Mail, label: t('contact.labels.email'), value: settings.companyEmail }
      : null,
    {
      icon: MessageCircle,
      label: t('contact.labels.whatsapp'),
      value: whatsapp,
      href: whatsAppUrl(whatsapp, t('contact.whatsappPrefill')),
    },
    settings.companyAddress
      ? { icon: MapPin, label: t('contact.labels.address'), value: settings.companyAddress }
      : null,
    settings.businessHours
      ? { icon: Clock, label: t('contact.labels.hours'), value: settings.businessHours }
      : null,
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];

  return (
    <PublicPageShell>
      <PageIntro
        kicker={t('contact.kicker')}
        title={t('contact.title')}
        description={t('contact.description')}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
        {contactItems.length > 0 && (
          <SaasPanel className="space-y-6 lg:col-span-1">
            {contactItems.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex gap-4 border-b border-[var(--border)] pb-5 last:border-0 last:pb-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-card)] border border-blue-200 bg-blue-50">
                  <Icon className="h-5 w-5 text-blue-900" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{label}</div>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-900 underline decoration-blue-200 underline-offset-2 hover:decoration-blue-900"
                    >
                      {value}
                    </a>
                  ) : (
                    <div className="text-sm text-gray-600">{value}</div>
                  )}
                </div>
              </div>
            ))}
          </SaasPanel>
        )}

        <div className={contactItems.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <SaasPanel>
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                  {t('contact.briefKicker')}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">{t('contact.briefHeading')}</h2>
              </div>
              <span className="hidden text-xs font-medium text-slate-500 sm:block">
                {t('contact.briefDuration')}
              </span>
            </div>
            <MultiStepForm
              source="contact-form"
              pageSource="/contact"
              defaultService={service}
              services={services.map((s) => ({ value: s.slug, label: s.name }))}
            />
          </SaasPanel>
          <CalendlyEmbed url={calendlyUrl} />
        </div>
      </div>
      <PageEndCta />
    </PublicPageShell>
  );
}
