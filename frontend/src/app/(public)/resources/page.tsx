import Link from 'next/link';
import { Download, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Free guides, whitepapers, and insights from DN Tech.',
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
    title: 'Enterprise Digital Transformation Guide',
    description: 'A comprehensive guide to planning and executing your digital transformation journey.',
    type: 'PDF Guide',
  },
  {
    title: 'Cloud Migration Checklist',
    description: 'Step-by-step checklist for migrating your infrastructure to the cloud safely.',
    type: 'Checklist',
  },
  {
    title: 'Web Application Security Best Practices',
    description: 'OWASP-aligned security practices for modern web applications.',
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
          <h1 className="text-4xl font-bold text-slate-900">Resources</h1>
          <p className="mt-4 text-slate-600">Free guides and insights to help your digital transformation</p>
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
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </a>
              ) : (
                <Link href="/contact" className="mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    Request Access <ArrowRight className="h-4 w-4" />
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
