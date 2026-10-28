import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageIntroProps {
  kicker?: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  /** Scroll-reveal on enter (homepage epic layer). */
  reveal?: boolean;
}

export function PageIntro({ kicker, title, description, children, reveal = true }: PageIntroProps) {
  return (
    <header
      className={cn(
        'dn-page-intro scene scene-page epic-section',
        reveal && 'epic-reveal',
      )}
    >
      <div className="layer depth-0" data-depth="0" aria-hidden="true" />
      <div className="dn-page-intro__inner">
        {kicker && <p className="dn-kicker">{kicker}</p>}
        <h1 className="dn-display">{title}</h1>
        {description && <div className="dn-lead">{description}</div>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}
