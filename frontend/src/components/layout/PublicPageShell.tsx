import Link from 'next/link';
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
    <div className={cn('saas-page py-10 sm:py-14', centered && 'text-center', className)}>
      <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', widthMap[width])}>{children}</div>
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
  return (
    <div
      className={cn(
        'saas-panel rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8',
        className
      )}
    >
      {children}
    </div>
  );
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
    <section className="saas-cta-band mt-14" aria-labelledby="page-cta-title">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 id="page-cta-title" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-blue-100">{description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={primaryHref}
            className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-5 py-2.5 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-blue-50"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="inline-flex min-h-11 items-center justify-center border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
