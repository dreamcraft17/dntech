'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoLight } from '@/components/branding/LogoLight';

const HeaderSearch = dynamic(
  () => import('@/components/common/HeaderSearch').then((mod) => mod.HeaderSearch),
  { ssr: false }
);

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/services', label: 'Layanan' },
  { href: '/products', label: 'Produk' },
  { href: '/about', label: 'Tentang' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Kontak' },
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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center hover:opacity-80 transition-opacity"
          aria-label="Beranda DN Tech"
        >
          <LogoLight />
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors min-h-[48px] flex items-center',
                pathname === link.href
                  ? 'text-blue-900 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSearchOpen((open) => !open);
              setMobileOpen(false);
            }}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label={searchOpen ? 'Tutup pencarian' : 'Buka pencarian'}
            aria-expanded={searchOpen}
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors min-h-[48px]"
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
            className="md:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-50 min-h-[48px] min-w-[48px] flex items-center justify-center"
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
          className="md:hidden border-t border-gray-200 bg-white px-4 py-3"
          aria-label="Navigasi mobile"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block px-3 py-3 text-sm font-medium rounded-lg min-h-[48px] flex items-center',
                pathname === link.href ? 'text-blue-900 bg-blue-50' : 'text-gray-600'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="block mt-2 px-3 py-3 text-sm font-semibold text-center text-white bg-blue-900 rounded-lg min-h-[48px] flex items-center justify-center"
          >
            Konsultasi Gratis
          </Link>
        </nav>
      )}
    </header>
  );
}
