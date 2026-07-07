import Link from 'next/link';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thank You',
  robots: { index: false },
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

export default async function ThankYouPage() {
  const settings = await getSettings();
  const leadMagnetUrl = settings.leadMagnetUrl as string | undefined;

  return (
    <div className="py-24">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-slate-900">Thank You!</h1>
        <p className="mt-4 text-slate-600">
          Your inquiry has been received. Our team will respond within 1 business day.
        </p>

        {leadMagnetUrl && (
          <div className="mt-8 p-6 rounded-xl bg-blue-50 border border-blue-100">
            <Download className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h2 className="font-semibold text-slate-900">Free Resource</h2>
            <p className="mt-2 text-sm text-slate-600">
              Download our Enterprise Digital Transformation Guide while you wait.
            </p>
            <a href={leadMagnetUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4">
              <Button>
                Download Guide <Download className="h-4 w-4" />
              </Button>
            </a>
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link href="/case-studies">
            <Button variant="outline">View Case Studies <ArrowRight className="h-4 w-4" /></Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
