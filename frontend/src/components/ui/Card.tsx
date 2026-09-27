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
        'saas-panel rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm',
        hover && 'transition-[border-color,box-shadow] hover:border-[var(--border-strong)] hover:shadow-md',
        className
      )}
    >
      {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      {children && <div className={cn(title || description ? 'mt-4' : '')}>{children}</div>}
      {footer && <div className="mt-4 border-t border-gray-200 pt-4">{footer}</div>}
    </div>
  );
}
