import { Link } from '@/i18n/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ShellWidth = '7xl' | '4xl' | '3xl' | '2xl';

const widthMap: Record<ShellWidth, string> = {
  '7xl': 'max-w-7xl',
  '4xl': 'max-w-4xl',
  '3xl': 'max-w-3xl',
  '2xl': 'max-w-2xl',
};

export function PublicPageShell({
  children,
  width = '7xl',
  className,
  centered,
}: {
  children: ReactNode;
  width?: ShellWidth;
  className?: string;
  centered?: boolean;
}) {
  return (
    <div className={cn('dn-page saas-page', centered && 'text-center', className)}>
      <div className={cn('dn-page__inner mx-auto', widthMap[width])}>{children}</div>
    </div>
  );
}

export function SaasPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('dn-panel saas-panel rounded-[var(--radius-card)]', className)}>{children}</div>;
}

export function PublicPageCta({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="dn-convert-band saas-cta-band epic-section epic-reveal" aria-labelledby="page-cta-title">
      <div className="dn-convert-band__inner">
        <h2 id="page-cta-title">{title}</h2>
        <p>{description}</p>
        <div className="dn-convert-band__actions">
          <Link href={primaryHref} className="dn-btn-primary">
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link href={secondaryHref} className="dn-btn-ghost">
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
