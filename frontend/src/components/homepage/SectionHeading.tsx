import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  /** Optional id for the h2 (e.g. section `aria-labelledby`). */
  titleId?: string;
  subtitle?: string;
  /** Short uppercase label shown above the heading — the shared identity
   * device that ties every homepage section together. */
  kicker?: string;
  /** Use the light-on-dark palette for sections with a navy/full-bleed background. */
  onDark?: boolean;
  /** Scroll-reveal motion (homepage epic layer). */
  reveal?: boolean;
  className?: string;
}

export function SectionHeading({
  title,
  titleId,
  subtitle,
  kicker,
  onDark = false,
  reveal = false,
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={cn('dn-section-head text-left', reveal && 'epic-reveal', className)}>
      {kicker && (
        <p
          className={cn(
            'dn-kicker mb-3',
            onDark && 'text-[var(--accent)] before:bg-[var(--accent)]',
          )}
        >
          {kicker}
        </p>
      )}
      <h2
        id={titleId}
        className={cn(
          'dn-display dn-h2',
          onDark ? 'text-white' : 'text-[var(--foreground)]',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn('mt-4 max-w-2xl text-base leading-7 sm:text-lg', onDark ? 'text-blue-100' : 'text-gray-600')}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
