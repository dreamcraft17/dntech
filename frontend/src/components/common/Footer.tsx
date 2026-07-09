'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { LogoDark } from '@/components/branding/LogoDark';

const footerLinks = {
  company: [
    { href: '/about', label: 'Tentang Kami' },
    { href: '/team', label: 'Tim Kami' },
    { href: '/careers', label: 'Karier' },
    { href: '/contact', label: 'Kontak' },
  ],
  services: [
    { href: '/services', label: 'Semua Layanan' },
    { href: '/case-studies', label: 'Studi Kasus' },
    { href: '/quiz', label: 'Temukan Solusi' },
    { href: '/resources', label: 'Sumber Daya' },
    { href: '/blog', label: 'Blog' },
    { href: '/faq', label: 'FAQ' },
  ],
  legal: [
    { href: '/terms', label: 'Syarat & Ketentuan' },
    { href: '/privacy', label: 'Kebijakan Privasi' },
  ],
};

interface FooterProps {
  companyName?: string;
  tagline?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
}

export function Footer({ companyName, tagline, companyEmail, companyPhone, companyAddress }: FooterProps) {
  const contactItems = [
    companyEmail ? { icon: Mail, label: 'Email', value: companyEmail } : null,
    companyPhone ? { icon: Phone, label: 'Telepon', value: companyPhone } : null,
    companyAddress ? { icon: MapPin, label: 'Alamat', value: companyAddress } : null,
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string }[];

  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Link href="/" className="inline-flex hover:opacity-80 transition-opacity" aria-label="Beranda DN Tech">
                <LogoDark />
              </Link>
            </div>
            {tagline && (
            <p className="text-sm text-gray-400 leading-relaxed">
              {tagline}
            </p>
            )}
            <div className="mt-6">
              <p className="text-sm font-medium text-white mb-2">Dapatkan update terbaru</p>
              <NewsletterForm compact />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Perusahaan</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Layanan</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {contactItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Kontak</h3>
              <ul className="space-y-3">
                {contactItems.map(({ icon: Icon, label, value }) => (
                  <li key={label} className="flex items-start gap-2 text-sm">
                    <Icon className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {companyName || 'DN Tech'}. Hak cipta dilindungi.
          </p>
          <div className="flex gap-4">
            {footerLinks.legal.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
