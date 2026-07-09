'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  open: boolean;
  message: string;
  variant?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Toast({
  open,
  message,
  variant = 'success',
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [open, onClose, duration]);

  if (!open) return null;

  const isSuccess = variant === 'success';

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-[100] flex w-[min(100vw-2rem,24rem)] items-start gap-3 rounded-lg border p-4 shadow-lg',
        isSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
      )}
      role="status"
      aria-live="polite"
    >
      {isSuccess ? (
        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
      )}
      <p className={cn('flex-1 text-sm font-medium', isSuccess ? 'text-green-900' : 'text-red-900')}>
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 text-gray-400 hover:text-gray-600"
        aria-label="Tutup notifikasi"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
