import type { ReactNode } from 'react';

interface PageIntroProps {
  kicker?: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}

export function PageIntro({ kicker, title, description, children }: PageIntroProps) {
  return (
    <header className="border-b border-slate-200 pb-10 sm:pb-12">
      <div className="max-w-3xl border-l-2 border-teal-600 pl-5 sm:pl-8">
        {kicker && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{kicker}</p>
        )}
        <h1 className={`${kicker ? 'mt-4' : ''} text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl`}>
          {title}
        </h1>
        {description && (
          <div className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            {description}
          </div>
        )}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </header>
  );
}
