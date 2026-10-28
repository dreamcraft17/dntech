import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DetailPageHeaderProps {
  kicker?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  reveal?: boolean;
}

/** Detail pages (product/service/case) — same type scale as PageIntro, with optional CTAs. */
export function DetailPageHeader({
  kicker,
  title,
  description,
  actions,
  reveal = true,
}: DetailPageHeaderProps) {
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
        {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </header>
  );
}
