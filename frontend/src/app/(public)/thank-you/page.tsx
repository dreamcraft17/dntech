import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThankYouRedirect } from '@/components/interactive/ThankYouRedirect';
import { PublicPageShell, SaasPanel } from '@/components/layout/PublicPageShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terima Kasih',
  robots: { index: false },
};

export default function ThankYouPage() {
  return (
    <>
      <ThankYouRedirect />
      <PublicPageShell width="2xl" centered>
        <SaasPanel className="text-center">
          <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-600" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-gray-900">Terima kasih telah menghubungi kami</h1>
          <p className="mt-4 text-gray-600">
            Permintaan Anda telah kami terima. Tim kami akan menghubungi Anda dalam <strong>24 jam kerja</strong>.
          </p>
          <p className="mt-2 text-sm text-gray-500">Anda akan diarahkan ke blog dalam beberapa detik...</p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href="/blog" variant="outline">
              Baca Artikel Terbaru <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/" variant="ghost">
              Kembali ke Beranda
            </Button>
          </div>
        </SaasPanel>
      </PublicPageShell>
    </>
  );
}
