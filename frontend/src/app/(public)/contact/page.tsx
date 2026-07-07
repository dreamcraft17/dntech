import { MultiStepForm } from '@/components/forms/MultiStepForm';
import { CalendlyEmbed } from '@/components/interactive/CalendlyEmbed';
import { buildMetadata, PAGE_SEO } from '@/lib/seo';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.contact.title,
  description: PAGE_SEO.contact.description,
  path: '/contact',
  keywords: PAGE_SEO.contact.keywords,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getSettings() {
  try {
    const res = await fetch(`${API_URL}/settings`, { next: { revalidate: 300 } });
    if (!res.ok) return {};
    return (await res.json()).data;
  } catch {
    return {};
  }
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const settings = await getSettings();
  const calendlyUrl = settings.calendlyUrl as string | undefined;

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900">Hubungi Kami</h1>
          <p className="mt-4 text-slate-600">Ceritakan proyek Anda — kami akan merespons dalam 1 hari kerja.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="space-y-6">
            {[
              { icon: Mail, label: 'Email', value: settings.companyEmail || 'hello@dntech.id' },
              { icon: Phone, label: 'Telepon', value: settings.companyPhone || '+62 21 1234 5678' },
              { icon: MapPin, label: 'Alamat', value: settings.companyAddress || 'Jakarta, Indonesia' },
              { icon: Clock, label: 'Jam Operasional', value: 'Sen - Jum, 9:00 - 18:00 WIB' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{label}</div>
                  <div className="text-sm text-slate-600">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Minta Demo Gratis</h2>
              <MultiStepForm source="contact-form" pageSource="/contact" defaultService={service} />
            </div>
            <CalendlyEmbed url={calendlyUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}
