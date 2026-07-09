'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'inverse' | 'outline-on-dark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

type ButtonAsButton = BaseButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = BaseButtonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-blue-900 text-white hover:bg-blue-800 focus:ring-blue-900',
  secondary: 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50 focus:ring-teal-600 bg-white',
  outline: 'border-2 border-blue-900 text-blue-900 hover:bg-blue-50 focus:ring-blue-900 bg-white',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
  inverse: 'bg-white text-blue-900 hover:bg-gray-100 focus:ring-white',
  'outline-on-dark':
    'border-2 border-white bg-transparent text-white hover:bg-white/10 focus:ring-white',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm min-h-[48px]',
  md: 'px-5 py-2.5 text-base min-h-[44px]',
  lg: 'px-6 py-3 text-base min-h-[48px]',
};

function getButtonClasses(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className
  );
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const {
      variant = 'primary',
      size = 'md',
      loading,
      className,
      children,
      ...rest
    } = props;

    const classes = getButtonClasses(variant, size, className);

    if ('href' in props && props.href) {
      const { href, ...linkRest } = rest as Omit<ButtonAsLink, keyof BaseButtonProps>;
      return (
        <Link
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          {...linkRest}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {children}
        </Link>
      );
    }

    const { disabled, type = 'button', ...buttonRest } = rest as Omit<ButtonAsButton, keyof BaseButtonProps>;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={classes}
        disabled={disabled || loading}
        {...buttonRest}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
