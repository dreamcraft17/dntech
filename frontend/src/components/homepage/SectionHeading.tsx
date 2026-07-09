interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeading({ title, subtitle, className = '' }: SectionHeadingProps) {
  return (
    <div className={`mb-10 text-center ${className}`}>
      <h2 className="text-3xl font-bold uppercase tracking-wide text-gray-900">{title}</h2>
      {subtitle && <p className="mt-3 max-w-2xl mx-auto text-gray-600">{subtitle}</p>}
    </div>
  );
}
