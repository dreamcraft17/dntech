import { MultiStepForm } from '@/components/forms/MultiStepForm';
import { CalendlyEmbed } from '@/components/interactive/CalendlyEmbed';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell, SaasPanel } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';
import { buildMetadata, PAGE_SEO } from '@/lib/seo';
import { getPublicSettings } from '@/lib/settings';
import { fetchPublicApiList } from '@/lib/server-api';
import type { Service } from '@/types';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.contact.title,
  description: PAGE_SEO.contact.description,
  path: '/contact',
  keywords: PAGE_SEO.contact.keywords,
});

async function getContactData() {
  const [settings, services] = await Promise.all([
    getPublicSettings(),
    fetchPublicApiList<Service>('/services', 60),
  ]);
  return { settings, services };
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const { settings, services } = await getContactData();
  const calendlyUrl = settings.calendlyUrl;

  const contactItems = [
    settings.companyEmail ? { icon: Mail, label: 'Email', value: settings.companyEmail } : null,
    settings.companyPhone ? { icon: Phone, label: 'Telepon', value: settings.companyPhone } : null,
    settings.companyAddress ? { icon: MapPin, label: 'Alamat', value: settings.companyAddress } : null,
    settings.businessHours ? { icon: Clock, label: 'Jam Operasional', value: settings.businessHours } : null,
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string }[];

  return (
    <PublicPageShell>
      <PageIntro
        kicker="Mulai percakapan"
        title="Bahas workflow yang ingin dibuat lebih rapi."
        description="Ceritakan konteks, batasan, dan hasil yang ingin dicapai. Tim kami akan merespons dalam 1 hari kerja dengan langkah berikutnya yang jelas."
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
        {contactItems.length > 0 && (
          <SaasPanel className="space-y-6 lg:col-span-1">
            {contactItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-4 border-b border-[var(--border)] pb-5 last:border-0 last:pb-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-card)] border border-blue-200 bg-blue-50">
                  <Icon className="h-5 w-5 text-blue-900" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{label}</div>
                  <div className="text-sm text-gray-600">{value}</div>
                </div>
              </div>
            ))}
          </SaasPanel>
        )}

        <div className={contactItems.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <SaasPanel>
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Project brief</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Bahas scope dan workflow Anda</h2>
              </div>
              <span className="hidden text-xs font-medium text-slate-500 sm:block">± 3 menit</span>
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
