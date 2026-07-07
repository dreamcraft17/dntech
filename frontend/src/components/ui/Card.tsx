import { cn } from '@/lib/utils';

interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ title, description, children, footer, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-6 shadow-sm',
        hover && 'transition-shadow hover:shadow-md',
        className
      )}
    >
      {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
      {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      {children && <div className={cn(title || description ? 'mt-4' : '')}>{children}</div>}
      {footer && <div className="mt-4 border-t border-slate-100 pt-4">{footer}</div>}
    </div>
  );
}
