import type { ReactNode } from 'react';
import { SaasPanel } from '@/components/layout/PublicPageShell';

interface DetailSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  /** When false, children render without a panel wrapper (e.g. grids). */
  panel?: boolean;
  className?: string;
}

export function DetailSection({ title, description, children, panel = false, className }: DetailSectionProps) {
  return (
    <section className={`mt-12 ${className ?? ''}`}>
      <h2 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>}
      <div className="mt-6">{panel ? <SaasPanel>{children}</SaasPanel> : children}</div>
    </section>
  );
}
