import { Download, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageIntro } from '@/components/layout/PageIntro';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { getPublicSettings, getResources } from '@/lib/settings';
import { buildMetadata, PAGE_SEO } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.resources.title,
  description: PAGE_SEO.resources.description,
  path: '/resources',
  keywords: PAGE_SEO.resources.keywords,
});

export default async function ResourcesPage() {
  const settings = await getPublicSettings();
  const resources = getResources(settings);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageIntro kicker="Sumber daya" title="Panduan yang bisa langsung dipakai" description="Panduan dan wawasan untuk mendukung transformasi digital Anda." />

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
                    <Download className="h-4 w-4" /> Unduh
                  </Button> : <Button
                    href="/contact"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Minta Akses <ArrowRight className="h-4 w-4" />
                  </Button>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-16 border-y border-slate-300 py-12">
            <p className="text-gray-600">Belum ada sumber daya tersedia. Hubungi kami untuk informasi lebih lanjut.</p>
            <Button href="/contact" variant="outline" className="mt-4">
              Hubungi Kami
            </Button>
          </div>
        )}

        <div className="max-w-md border-t border-slate-300 pt-8">
            <NewsletterForm />
        </div>
      </div>
    </div>
  );
}
