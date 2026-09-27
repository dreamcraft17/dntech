import type { ReactNode } from 'react';
import { SaasPanel } from '@/components/layout/PublicPageShell';

interface SaasEmptyStateProps {
  title?: string;
  description: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function SaasEmptyState({ title, description, actions, className }: SaasEmptyStateProps) {
  return (
    <SaasPanel className={`text-center ${className ?? ''}`}>
      {title && <p className="text-lg font-semibold text-slate-950">{title}</p>}
      <p className={`${title ? 'mt-2' : ''} mx-auto max-w-md text-sm leading-relaxed text-gray-600`}>
        {description}
      </p>
      {actions && <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>}
    </SaasPanel>
  );
}
