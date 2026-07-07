'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { Logo } from '@/components/common/Logo';

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

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo href="/" size="lg" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Solusi teknologi terpercaya untuk digitalisasi bisnis Anda.
            </p>
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

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                hello@dntech.id
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                +62 21 1234 5678
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                Jakarta, Indonesia
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} DN Tech. Hak cipta dilindungi.</p>
          <div className="flex gap-4">
            {footerLinks.legal.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-slate-500 hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
