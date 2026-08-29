import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeading({ title, subtitle, className = '' }: SectionHeadingProps) {
  return (
    <div className={cn('mb-10 text-left', className)}>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h2>
      {subtitle && <p className="mt-3 max-w-2xl text-gray-600">{subtitle}</p>}
    </div>
  );
}
