import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThankYouRedirect } from '@/components/interactive/ThankYouRedirect';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terima Kasih',
  robots: { index: false },
};

export default function ThankYouPage() {
  return (
    <>
      <ThankYouRedirect />
      <div className="py-24">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900">Terima kasih telah menghubungi kami</h1>
          <p className="mt-4 text-gray-600">
            Permintaan Anda telah kami terima. Tim kami akan menghubungi Anda dalam <strong>24 jam kerja</strong>.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Anda akan diarahkan ke blog dalam beberapa detik...
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link href="/blog">
              <Button variant="outline">Baca Artikel Terbaru <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <Link href="/">
              <Button variant="ghost">Kembali ke Beranda</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
