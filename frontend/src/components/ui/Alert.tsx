import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

const variantConfig = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    title: 'text-red-900',
    text: 'text-red-800',
    Icon: AlertCircle,
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    title: 'text-green-900',
    text: 'text-green-800',
    Icon: CheckCircle,
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-900',
    text: 'text-yellow-800',
    Icon: AlertTriangle,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-900',
    title: 'text-blue-900',
    text: 'text-blue-800',
    Icon: Info,
  },
};

export function Alert({ variant = 'info', title, children, className, onClose }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.Icon;

  return (
    <div
      className={cn('flex gap-3 rounded-lg border p-4', config.bg, config.border, className)}
      role="alert"
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.icon)} aria-hidden />
      <div className="flex-1 min-w-0">
        {title && <h3 className={cn('font-semibold', config.title)}>{title}</h3>}
        <div className={cn(title ? 'mt-1 text-sm' : 'text-sm', config.text)}>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-gray-400 hover:text-gray-600"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
