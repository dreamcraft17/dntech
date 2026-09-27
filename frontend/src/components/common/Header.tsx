'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoLight } from '@/components/branding/LogoLight';

const HeaderSearch = dynamic(
  () => import('@/components/common/HeaderSearch').then((mod) => mod.HeaderSearch),
  { ssr: false }
);

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/products', label: 'Produk' },
  { href: '/case-studies', label: 'Bukti' },
  { href: '/about', label: 'Tentang' },
];

const navGroups = [
  {
    label: 'Solusi',
    links: [
      { href: '/services', label: 'Layanan custom' },
      { href: '/quiz', label: 'Temukan solusi' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { href: '/blog', label: 'Blog & wawasan' },
      { href: '/resources', label: 'Panduan' },
      { href: '/faq', label: 'Pusat bantuan' },
    ],
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const menu = mobileMenuRef.current;
    if (!menu) return;

    const focusables = Array.from(
      menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab' || focusables.length === 0) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center hover:opacity-80 transition-opacity"
          aria-label="Beranda DN Tech"
        >
          <LogoLight />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex min-h-[48px] items-center border-b-2 border-transparent px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'border-blue-900 text-blue-900'
                  : 'text-gray-600 hover:border-gray-300 hover:text-gray-900'
              )}
            >
              {link.label}
            </Link>
          ))}
          {navGroups.map((group) => (
            <details key={group.label} className="group relative">
              <summary className="flex min-h-[48px] cursor-pointer list-none items-center gap-1 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 [&::-webkit-details-marker]:hidden">
                {group.label}
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="absolute left-0 top-full z-50 mt-1 w-56 border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg">
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="block border-l-2 border-transparent px-3 py-3 text-sm text-gray-700 transition-colors hover:border-[var(--accent)] hover:bg-slate-50 hover:text-blue-900">
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSearchOpen((open) => !open);
              setMobileOpen(false);
            }}
            className="flex min-h-[48px] min-w-[48px] items-center justify-center border-l border-[var(--border)] p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label={searchOpen ? 'Tutup pencarian' : 'Buka pencarian'}
            aria-expanded={searchOpen}
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/contact"
            className="hidden min-h-[48px] items-center border border-blue-900 bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 sm:inline-flex"
          >
            Konsultasi Gratis
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => {
              setMobileOpen((open) => !open);
              setSearchOpen(false);
            }}
            className="flex min-h-[48px] min-w-[48px] items-center justify-center border-l border-[var(--border)] p-2 text-gray-600 transition-colors hover:bg-gray-100"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen && <HeaderSearch open={searchOpen} onClose={() => setSearchOpen(false)} />}

      {mobileOpen && (
        <nav
          id="mobile-nav"
          ref={mobileMenuRef}
          className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3"
          aria-label="Navigasi mobile"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex min-h-[48px] items-center border-b border-[var(--border)] px-3 py-3 text-sm font-medium',
                pathname === link.href ? 'text-blue-900' : 'text-gray-600'
              )}
            >
              {link.label}
            </Link>
          ))}
          {navGroups.map((group) => (
            <div key={group.label} className="border-b border-[var(--border)] py-3">
              <p className="px-3 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{group.label}</p>
              {group.links.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="flex min-h-[44px] items-center px-3 text-sm text-gray-600 hover:text-blue-900">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="mt-3 flex min-h-[48px] items-center justify-center border border-blue-900 bg-blue-900 px-3 py-3 text-center text-sm font-semibold text-white"
          >
            Konsultasi Gratis
          </Link>
        </nav>
      )}
    </header>
  );
}
