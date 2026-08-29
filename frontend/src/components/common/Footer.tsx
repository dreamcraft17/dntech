import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FooterBrand } from '@/components/layout/FooterBrand';

const primaryLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/products', label: 'Produk' },
  { href: '/services', label: 'Layanan' },
  { href: '/about', label: 'Tentang' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Kontak' },
];

const secondaryLinks = [
  { href: '/case-studies', label: 'Studi Kasus' },
  { href: '/quiz', label: 'Temukan Solusi' },
  { href: '/resources', label: 'Sumber Daya' },
  { href: '/team', label: 'Tim' },
  { href: '/careers', label: 'Karier' },
  { href: '/faq', label: 'FAQ' },
];

const legalLinks = [
  { href: '/terms', label: 'Syarat & Ketentuan' },
  { href: '/privacy', label: 'Kebijakan Privasi' },
];

interface FooterProps {
  companyName?: string;
  tagline?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-gray-600 transition-colors hover:text-blue-900"
    >
      {children}
    </Link>
  );
}

export function Footer({
  companyName,
  tagline,
  companyEmail,
  companyPhone,
  companyAddress,
}: FooterProps) {
  const contactItems = [
    companyEmail ? { icon: Mail, value: companyEmail, href: `mailto:${companyEmail}` } : null,
    companyPhone ? { icon: Phone, value: companyPhone, href: `tel:${companyPhone}` } : null,
    companyAddress ? { icon: MapPin, value: companyAddress } : null,
  ].filter(Boolean) as {
    icon: typeof Mail;
    value: string;
    href?: string;
  }[];

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <FooterBrand />
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {tagline || 'Software house Indonesia untuk startup & UMKM.'}
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center justify-center self-start rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 min-h-[44px]"
          >
            Konsultasi Gratis
          </Link>
        </div>

        <nav
          className="mt-8 border-t border-gray-100 pt-8"
          aria-label="Navigasi footer"
        >
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {primaryLinks.map((link) => (
              <li key={link.href}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </ul>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            {secondaryLinks.map((link) => (
              <li key={link.href}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </ul>
        </nav>

        {contactItems.length > 0 && (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
            {contactItems.map(({ icon: Icon, value, href }, index) => (
              <div key={value} className="flex items-center gap-2 text-sm text-gray-500">
                {index > 0 && (
                  <span className="hidden sm:inline text-gray-300" aria-hidden="true">
                    ·
                  </span>
                )}
                <Icon className="h-4 w-4 shrink-0 text-blue-900" />
                {href ? (
                  <a href={href} className="transition-colors hover:text-blue-900">
                    {value}
                  </a>
                ) : (
                  <span>{value}</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {companyName || 'DN Tech'}. Hak cipta dilindungi.
          </p>
          <div className="flex flex-wrap gap-4">
            {legalLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
