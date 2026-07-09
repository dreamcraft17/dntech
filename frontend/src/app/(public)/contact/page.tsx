import { MultiStepForm } from '@/components/forms/MultiStepForm';
import { CalendlyEmbed } from '@/components/interactive/CalendlyEmbed';
import { buildMetadata, PAGE_SEO } from '@/lib/seo';
import { getPublicSettings } from '@/lib/settings';
import { asArray } from '@/lib/api';
import type { Service } from '@/types';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.contact.title,
  description: PAGE_SEO.contact.description,
  path: '/contact',
  keywords: PAGE_SEO.contact.keywords,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getContactData() {
  try {
    const [settings, servicesRes] = await Promise.all([
      getPublicSettings(),
      fetch(`${API_URL}/services`, { next: { revalidate: 60 } }),
    ]);
    const services = servicesRes.ok
      ? asArray<Service>((await servicesRes.json()).data)
      : [];
    return { settings, services };
  } catch {
    return { settings: {}, services: [] };
  }
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
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Hubungi Kami</h1>
          <p className="mt-4 text-gray-600">Ceritakan proyek Anda — kami akan merespons dalam 1 hari kerja.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {contactItems.length > 0 && (
            <div className="space-y-6">
              {contactItems.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-blue-900" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{label}</div>
                    <div className="text-sm text-gray-600">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={contactItems.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Mulai Konsultasi Gratis</h2>
              <MultiStepForm
                source="contact-form"
                pageSource="/contact"
                defaultService={service}
                services={services.map((s) => ({ value: s.slug, label: s.name }))}
              />
            </div>
            <CalendlyEmbed url={calendlyUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}
