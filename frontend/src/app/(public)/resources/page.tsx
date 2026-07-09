import Link from 'next/link';
import { Download, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { getPublicSettings, getResources } from '@/lib/settings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sumber Daya',
  description: 'Panduan, whitepaper, dan wawasan dari DN Tech.',
};

export default async function ResourcesPage() {
  const settings = await getPublicSettings();
  const resources = getResources(settings);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Sumber Daya</h1>
          <p className="mt-4 text-gray-600">Panduan dan wawasan untuk mendukung transformasi digital Anda</p>
        </div>

        {resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {resources.map((resource) => (
              <Card key={resource.title} className="flex flex-col">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5 text-blue-900" />
                </div>
                {resource.type && (
                  <span className="text-xs text-blue-900 font-medium">{resource.type}</span>
                )}
                <h3 className="mt-1 font-semibold text-gray-900">{resource.title}</h3>
                {resource.description && (
                  <p className="mt-2 text-sm text-gray-600 flex-1">{resource.description}</p>
                )}
                {resource.downloadUrl ? (
                  <a href={resource.downloadUrl} target="_blank" rel="noopener noreferrer" className="mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4" /> Unduh
                    </Button>
                  </a>
                ) : (
                  <Link href="/contact" className="mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      Minta Akses <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-16 rounded-xl border border-dashed border-gray-200 bg-gray-50">
            <p className="text-gray-600">Belum ada sumber daya tersedia. Hubungi kami untuk informasi lebih lanjut.</p>
            <Link href="/contact" className="inline-block mt-4">
              <Button variant="outline">Hubungi Kami</Button>
            </Link>
          </div>
        )}

        <div className="max-w-md mx-auto">
          <Card>
            <NewsletterForm />
          </Card>
        </div>
      </div>
    </div>
  );
}
