import type { ReactNode } from 'react';

interface PageIntroProps {
  kicker?: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}

export function PageIntro({ kicker, title, description, children }: PageIntroProps) {
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
          <div className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            {description}
          </div>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}
