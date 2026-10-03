import Image from 'next/image';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  hero: 96,
} as const;

export type LogoSize = keyof typeof SIZES;

interface LogoProps {
  size?: LogoSize;
  className?: string;
  href?: string | null;
  priority?: boolean;
}

/**
 * Only rendered on the localised public site (admin always passes `href={null}`),
 * so the i18n hooks/Link stay out of the admin tree, which has no intl provider.
 */
function LogoHomeLink({ href, children }: { href: string; children: ReactNode }) {
  const t = useTranslations('layout');

  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label={t('homeAria')}>
      {children}
    </Link>
  );
}

export function Logo({ size = 'md', className, href = '/', priority = false }: LogoProps) {
  const dim = SIZES[size];

  const image = (
    <Image
      src="/rlogo2.png"
      alt="DN Tech — Powering Your System"
      width={dim}
      height={dim}
      priority={priority}
      className={cn('object-contain', className)}
    />
  );

  if (href) {
    return <LogoHomeLink href={href}>{image}</LogoHomeLink>;
  }

  return <span className="inline-flex shrink-0 items-center">{image}</span>;
}
