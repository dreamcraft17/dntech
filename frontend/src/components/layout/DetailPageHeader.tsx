import type { ReactNode } from 'react';

interface DetailPageHeaderProps {
  kicker?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

/** Detail pages (product/service/case) — same type scale as PageIntro, with optional CTAs. */
export function DetailPageHeader({ kicker, title, description, actions }: DetailPageHeaderProps) {
  return (
    <header className="saas-intro-band mb-10 pb-10 sm:mb-12 sm:pb-12">
      <div className="max-w-3xl">
        {kicker && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)]">{kicker}</p>
        )}
        <h1
          className={`${kicker ? 'mt-3' : ''} text-3xl font-bold leading-[1.12] tracking-tight text-slate-950 sm:text-4xl lg:text-[2.65rem]`}
        >
          {title}
        </h1>
        {description && (
          <div className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{description}</div>
        )}
        {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </header>
  );
}
