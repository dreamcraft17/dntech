import Link from 'next/link';
import { Download, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sumber Daya',
  description: 'Panduan gratis, whitepaper, dan wawasan dari DN Tech.',
};

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

const RESOURCES = [
  {
    title: 'Panduan Transformasi Digital Enterprise',
    description: 'Panduan komprehensif untuk merencanakan dan menjalankan perjalanan transformasi digital Anda.',
    type: 'Panduan PDF',
  },
  {
    title: 'Checklist Migrasi Cloud',
    description: 'Checklist langkah demi langkah untuk memigrasikan infrastruktur Anda ke cloud dengan aman.',
    type: 'Checklist',
  },
  {
    title: 'Praktik Terbaik Keamanan Aplikasi Web',
    description: 'Praktik keamanan selaras OWASP untuk aplikasi web modern.',
    type: 'Whitepaper',
  },
];

export default async function ResourcesPage() {
  const settings = await getSettings();
  const leadMagnetUrl = settings.leadMagnetUrl as string | undefined;

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900">Sumber Daya</h1>
          <p className="mt-4 text-slate-600">Panduan gratis dan wawasan untuk mendukung transformasi digital Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {RESOURCES.map((resource, i) => (
            <Card key={resource.title} className="flex flex-col">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs text-blue-600 font-medium">{resource.type}</span>
              <h3 className="mt-1 font-semibold text-slate-900">{resource.title}</h3>
              <p className="mt-2 text-sm text-slate-600 flex-1">{resource.description}</p>
              {i === 0 && leadMagnetUrl ? (
                <a href={leadMagnetUrl} target="_blank" rel="noopener noreferrer" className="mt-4">
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

        <div className="max-w-md mx-auto">
          <Card>
            <NewsletterForm />
          </Card>
        </div>
      </div>
    </div>
  );
}
