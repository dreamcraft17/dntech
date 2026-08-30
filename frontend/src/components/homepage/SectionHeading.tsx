import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  /** Short uppercase label shown above the heading — the shared identity
   * device that ties every homepage section together. */
  kicker?: string;
  /** Use the light-on-dark palette for sections with a navy/full-bleed background. */
  onDark?: boolean;
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  kicker,
  onDark = false,
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={cn('mb-10 text-left md:mb-14', className)}>
      {kicker && (
        <p
          className={cn(
            'mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em]',
            onDark ? 'text-[var(--accent)]' : 'text-[var(--secondary)]'
          )}
        >
          <span className="h-px w-8 bg-[var(--accent)]" aria-hidden="true" />
          {kicker}
        </p>
      )}
      <h2
        className={cn(
          'text-3xl font-bold tracking-tight sm:text-4xl',
          onDark ? 'text-white' : 'text-gray-900'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn('mt-3 max-w-2xl', onDark ? 'text-blue-100' : 'text-gray-600')}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
