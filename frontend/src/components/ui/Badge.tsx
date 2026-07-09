import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'error';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantConfig: Record<BadgeVariant, string> = {
  default: 'bg-blue-50 text-blue-900 border border-blue-200',
  secondary: 'bg-teal-50 text-teal-900 border border-teal-200',
  success: 'bg-green-50 text-green-900 border border-green-200',
  warning: 'bg-yellow-50 text-yellow-900 border border-yellow-200',
  error: 'bg-red-50 text-red-900 border border-red-200',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        variantConfig[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
