import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FooterBrand } from '@/components/layout/FooterBrand';

const companyLinks = [
  { href: '/about', label: 'Tentang' },
  { href: '/team', label: 'Tim' },
  { href: '/careers', label: 'Karier' },
  { href: '/contact', label: 'Kontak' },
];

const offerLinks = [
  { href: '/products', label: 'Produk' },
  { href: '/services', label: 'Layanan' },
  { href: '/quiz', label: 'Temukan solusi' },
];

const proofLinks = [
  { href: '/case-studies', label: 'Studi kasus' },
  { href: '/portfolio', label: 'Portofolio' },
  { href: '/testimonials', label: 'Testimoni' },
];

const resourceLinks = [
  { href: '/blog', label: 'Blog' },
  { href: '/resources', label: 'Panduan' },
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
      className="inline-flex min-h-11 items-center rounded-sm text-sm text-gray-600 transition-colors hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

export function Footer({
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
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <FooterBrand />
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {tagline || 'Software untuk workflow penting bisnis Indonesia.'}
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center self-start rounded-[var(--radius-card)] border border-blue-900 bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
          >
            Konsultasi Gratis
          </Link>
        </div>

        <nav
          className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-[var(--border)] pt-10 lg:grid-cols-5"
          aria-label="Navigasi footer"
        >
          <FooterColumn title="Perusahaan">
            <ul className="mt-2 flex flex-col">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title="Produk & layanan">
            <ul className="mt-2 flex flex-col">
              {offerLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title="Bukti kerja">
            <ul className="mt-2 flex flex-col">
              {proofLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title="Resources">
            <ul className="mt-2 flex flex-col">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title="Hubungi">
            <ul className="mt-2 flex flex-col">
              {contactItems.map(({ icon: Icon, value, href }) => (
                <li key={value}>
                  <div className="flex min-h-11 items-center gap-2 text-sm text-gray-600">
                    <Icon className="h-4 w-4 shrink-0 text-blue-900" aria-hidden="true" />
                    {href ? (
                      <a
                        href={href}
                        className="rounded-sm transition-colors hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2"
                      >
                        {value}
                      </a>
                    ) : (
                      <span>{value}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </FooterColumn>
        </nav>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PT. Dozer Napitupulu Technology. Hak cipta dilindungi.
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
