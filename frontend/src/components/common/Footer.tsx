'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { NewsletterForm } from '@/components/forms/NewsletterForm';

const footerLinks = {
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/team', label: 'Our Team' },
    { href: '/careers', label: 'Careers' },
    { href: '/contact', label: 'Contact' },
  ],
  services: [
    { href: '/services', label: 'All Services' },
    { href: '/case-studies', label: 'Case Studies' },
    { href: '/quiz', label: 'Solution Finder' },
    { href: '/resources', label: 'Resources' },
    { href: '/blog', label: 'Blog' },
    { href: '/faq', label: 'FAQ' },
  ],
  legal: [
    { href: '/terms', label: 'Terms of Service' },
    { href: '/privacy', label: 'Privacy Policy' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                DN
              </div>
              <span className="text-xl font-bold text-white">DN Tech</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Solusi teknologi terpercaya untuk digitalisasi bisnis Anda.
            </p>
            <div className="mt-6">
              <p className="text-sm font-medium text-white mb-2">Stay updated</p>
              <NewsletterForm compact />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
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
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} DN Tech. All rights reserved.</p>
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
