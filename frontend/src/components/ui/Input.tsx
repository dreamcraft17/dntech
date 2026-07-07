import { useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-') || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const describedBy = [
    props['aria-describedby'],
    error ? errorId : null,
    helperText && !error ? helperId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-800">
          {label}
          {props.required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-500 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 disabled:bg-gray-50 min-h-[48px]',
          error && 'border-red-600 focus:border-red-600 focus:ring-red-600/20',
          className
        )}
        {...props}
      />
      {error && <p id={errorId} className="text-sm text-red-600" role="alert">{error}</p>}
      {helperText && !error && <p id={helperId} className="text-sm text-gray-600">{helperText}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const generatedId = useId();
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-') || generatedId;
  const errorId = `${inputId}-error`;
  const describedBy = [
    props['aria-describedby'],
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-800">
          {label}
          {props.required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-500 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20',
          error && 'border-red-600',
          className
        )}
        {...props}
      />
      {error && <p id={errorId} className="text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const generatedId = useId();
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-') || generatedId;
  const errorId = `${inputId}-error`;
  const describedBy = [
    props['aria-describedby'],
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-800">
          {label}
          {props.required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <select
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-900 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 min-h-[48px] bg-white',
          error && 'border-red-600',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p id={errorId} className="text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}
