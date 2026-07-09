import Link from 'next/link';
import { Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PublicSettings } from '@/lib/settings';

interface HomeContactCtaProps {
  settings: PublicSettings;
}

export function HomeContactCta({ settings }: HomeContactCtaProps) {
  const email = settings.companyEmail || 'hello@dntech.id';
  const phone = settings.companyPhone;
  const linkedin = settings.socialLinks?.linkedin;
  const calendly = settings.calendlyUrl;

  return (
    <section className="bg-blue-900 py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold">Siap untuk Diskusi?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-blue-100">
          Hubungi kami untuk konsultasi gratis 30 menit. Bahas kebutuhan, timeline, dan budget —
          tanpa kewajiban.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {calendly ? (
            <a
              href={calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-900 transition-colors hover:bg-gray-100 min-h-[48px]"
            >
              <Calendar className="h-4 w-4" />
              Schedule Konsultasi
            </a>
          ) : (
            <Button href="/contact" size="lg" variant="inverse">
              Konsultasi Gratis
            </Button>
          )}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap sm:gap-8">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white transition-colors"
          >
            <Mail className="h-4 w-4 text-white" />
            {email}
          </a>
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white transition-colors"
            >
              <Phone className="h-4 w-4 text-white" />
              WhatsApp / {phone}
            </a>
          )}
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white transition-colors"
            >
              <span className="h-4 w-4 text-white font-bold text-xs">in</span>
              LinkedIn
            </a>
          )}
        </div>

        <p className="mt-8 text-sm text-blue-200">
          Atau langsung ke{' '}
          <Link href="/contact" className="font-medium text-white underline underline-offset-2">
            halaman kontak
          </Link>
        </p>
      </div>
    </section>
  );
}
