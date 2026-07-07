'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { LogoLight } from '@/components/branding/LogoLight';
import type { SearchResult } from '@/types';

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/services', label: 'Layanan' },
  { href: '/about', label: 'Tentang' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Kontak' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  async function handleSearch(q: string) {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await apiFetch<SearchResult[]>(`/search?q=${encodeURIComponent(q)}`);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex shrink-0 items-center hover:opacity-80 transition-opacity" aria-label="Beranda DN Tech">
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
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label="Cari"
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
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-50 min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="mx-auto max-w-7xl">
            <input
              type="search"
              placeholder="Cari layanan, blog..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
              autoFocus
            />
            {searchResults.length > 0 && (
              <div className="mt-2 rounded-lg border border-gray-200 bg-white">
                {searchResults.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      router.push(result.url);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <div className="text-sm font-medium text-gray-900">{result.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{result.type} · {result.snippet}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {mobileOpen && (
        <nav className="md:hidden border-t border-gray-200 bg-white px-4 py-3" aria-label="Navigasi mobile">
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
