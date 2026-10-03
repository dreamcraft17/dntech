'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Menu, X, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoLight } from '@/components/branding/LogoLight';
import { LocaleSwitcher } from '@/components/common/LocaleSwitcher';
import { Link, usePathname } from '@/i18n/navigation';

const HeaderSearch = dynamic(
  () => import('@/components/common/HeaderSearch').then((mod) => mod.HeaderSearch),
  { ssr: false }
);

const navLinks = [
  { href: '/products', key: 'products' },
  { href: '/about', key: 'about' },
] as const;

const navGroups = [
  {
    key: 'services',
    links: [
      { href: '/services', key: 'allServices' },
      { href: '/quiz', key: 'findSolution' },
      { href: '/contact', key: 'consultation' },
    ],
  },
  {
    key: 'proof',
    links: [
      { href: '/case-studies', key: 'caseStudies' },
      { href: '/portfolio', key: 'portfolio' },
      { href: '/testimonials', key: 'testimonials' },
    ],
  },
  {
    key: 'resources',
    links: [
      { href: '/blog', key: 'blog' },
      { href: '/resources', key: 'guides' },
      { href: '/faq', key: 'helpCenter' },
      { href: '/careers', key: 'careers' },
    ],
  },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupIsActive(pathname: string, links: readonly { href: string }[]) {
  return links.some((link) => isNavActive(pathname, link.href));
}

export function Header() {
  const t = useTranslations('nav');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!openGroup) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setOpenGroup(null);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenGroup(null);
    }

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [openGroup]);

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
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-sm supports-[backdrop-filter]:bg-[var(--surface)]/90"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-w-0 shrink items-center transition-opacity hover:opacity-80"
          aria-label={t('homeAria')}
        >
          <LogoLight size="sm" className="sm:[&_span:last-child]:inline-flex [&_span:last-child]:hidden" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t('ariaMain')}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpenGroup(null)}
              className={cn(
                'flex min-h-[48px] items-center border-b-2 border-transparent px-3 py-2 text-sm font-medium transition-colors',
                isNavActive(pathname, link.href)
                  ? 'border-blue-900 text-blue-900'
                  : 'text-gray-600 hover:border-gray-300 hover:text-gray-900'
              )}
            >
              {t(link.key)}
            </Link>
          ))}
          {navGroups.map((group) => {
            const isOpen = openGroup === group.key;
            const menuId = `nav-menu-${group.key}`;
            const active = groupIsActive(pathname, group.links);
            return (
              <div key={group.key} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenGroup((current) => (current === group.key ? null : group.key))}
                  aria-expanded={isOpen}
                  aria-controls={menuId}
                  className={cn(
                    'flex min-h-[48px] items-center gap-1 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                    isOpen || active
                      ? 'border-blue-900 text-blue-900'
                      : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                  )}
                >
                  {t(`groups.${group.key}`)}
                  <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
                </button>
                {isOpen && (
                  <div
                    id={menuId}
                    className="absolute left-0 top-full z-50 mt-1 w-56 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg"
                  >
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpenGroup(null)}
                        className={cn(
                          'block rounded-md border-l-2 border-transparent px-3 py-3 text-sm text-gray-700 transition-colors hover:border-[var(--accent)] hover:bg-slate-50 hover:text-blue-900',
                          isNavActive(pathname, link.href) && 'border-blue-900 bg-slate-50 font-medium text-blue-900'
                        )}
                      >
                        {t(`links.${link.key}`)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              setSearchOpen((open) => !open);
              setMobileOpen(false);
              setOpenGroup(null);
            }}
            className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-[var(--radius-card)] px-2.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:min-w-[48px] lg:px-2"
            aria-label={searchOpen ? t('search.close') : t('search.open')}
            aria-expanded={searchOpen}
            title={t('search.title')}
          >
            <Search className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium lg:sr-only">{t('search.label')}</span>
          </button>
          <LocaleSwitcher className="hidden sm:flex" />
          <Link
            href="/contact"
            className="hidden min-h-[48px] items-center rounded-[var(--radius-card)] border border-blue-900 bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 lg:inline-flex"
          >
            {t('ctaConsultation')}
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => {
              setMobileOpen((open) => !open);
              setSearchOpen(false);
              setOpenGroup(null);
            }}
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-[var(--radius-card)] p-2 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
            aria-label={mobileOpen ? t('menu.close') : t('menu.open')}
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
          className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 md:hidden"
          aria-label={t('ariaMobile')}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex min-h-[48px] items-center border-b border-[var(--border)] px-3 py-3 text-sm font-medium',
                isNavActive(pathname, link.href) ? 'text-blue-900' : 'text-gray-600'
              )}
            >
              {t(link.key)}
            </Link>
          ))}
          {navGroups.map((group) => (
            <div key={group.key} className="border-b border-[var(--border)] py-3">
              <p className="px-3 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{t(`groups.${group.key}`)}</p>
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex min-h-[44px] items-center px-3 text-sm text-gray-600 hover:text-blue-900',
                    isNavActive(pathname, link.href) && 'font-medium text-blue-900'
                  )}
                >
                  {t(`links.${link.key}`)}
                </Link>
              ))}
            </div>
          ))}
          <LocaleSwitcher className="mt-3 w-fit sm:hidden" />
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="mt-3 flex min-h-[48px] items-center justify-center rounded-[var(--radius-card)] border border-blue-900 bg-blue-900 px-3 py-3 text-center text-sm font-semibold text-white"
          >
            {t('ctaConsultation')}
          </Link>
        </nav>
      )}
    </header>
  );
}
