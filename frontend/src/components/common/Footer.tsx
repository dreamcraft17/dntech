import { useTranslations } from 'next-intl';
import { Mail, MessageCircle, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { FooterBrand } from '@/components/layout/FooterBrand';
import { resolveCompanyPhone, whatsAppUrl } from '@/lib/contact-links';

const companyLinks = [
  { href: '/about', key: 'about' },
  { href: '/team', key: 'team' },
  { href: '/careers', key: 'careers' },
  { href: '/contact', key: 'contact' },
] as const;

const offerLinks = [
  { href: '/products', key: 'products' },
  { href: '/services', key: 'services' },
  { href: '/quiz', key: 'quiz' },
] as const;

const proofLinks = [
  { href: '/case-studies', key: 'caseStudies' },
  { href: '/portfolio', key: 'portfolio' },
  { href: '/testimonials', key: 'testimonials' },
] as const;

const resourceLinks = [
  { href: '/blog', key: 'blog' },
  { href: '/resources', key: 'guides' },
  { href: '/faq', key: 'faq' },
] as const;

const legalLinks = [
  { href: '/terms', key: 'terms' },
  { href: '/privacy', key: 'privacy' },
] as const;

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
  const t = useTranslations('footer');
  const whatsapp = resolveCompanyPhone(companyPhone);

  const contactItems = [
    companyEmail ? { icon: Mail, value: companyEmail, href: `mailto:${companyEmail}` } : null,
    {
      icon: MessageCircle,
      value: whatsapp,
      href: whatsAppUrl(whatsapp),
      external: true,
    },
    companyAddress ? { icon: MapPin, value: companyAddress } : null,
  ].filter(Boolean) as {
    icon: typeof Mail;
    value: string;
    href?: string;
    external?: boolean;
  }[];

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <FooterBrand />
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {tagline || t('defaultTagline')}
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center self-start rounded-[var(--radius-card)] border border-blue-900 bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
          >
            {t('cta')}
          </Link>
        </div>

        <nav
          className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-[var(--border)] pt-10 lg:grid-cols-5"
          aria-label={t('navAria')}
        >
          <FooterColumn title={t('columns.company')}>
            <ul className="mt-2 flex flex-col">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{t(`links.${link.key}`)}</FooterLink>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title={t('columns.offer')}>
            <ul className="mt-2 flex flex-col">
              {offerLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{t(`links.${link.key}`)}</FooterLink>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title={t('columns.proof')}>
            <ul className="mt-2 flex flex-col">
              {proofLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{t(`links.${link.key}`)}</FooterLink>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title={t('columns.resources')}>
            <ul className="mt-2 flex flex-col">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{t(`links.${link.key}`)}</FooterLink>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title={t('columns.contact')}>
            <ul className="mt-2 flex flex-col">
              {contactItems.map(({ icon: Icon, value, href, external }) => (
                <li key={value}>
                  <div className="flex min-h-11 items-center gap-2 text-sm text-gray-600">
                    <Icon className="h-4 w-4 shrink-0 text-blue-900" aria-hidden="true" />
                    {href ? (
                      <a
                        href={href}
                        {...(external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        className="rounded-sm transition-colors hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2"
                      >
                        {external ? t('whatsapp', { value }) : value}
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
            {t('copyright', { year: String(new Date().getFullYear()) })}
          </p>
          <div className="flex flex-wrap gap-4">
            {legalLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {t(`links.${link.key}`)}
              </FooterLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
