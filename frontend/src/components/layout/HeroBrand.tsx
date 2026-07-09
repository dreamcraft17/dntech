interface HeroBrandProps {
  tagline: string;
  description?: string;
}

export function HeroBrand({ tagline, description }: HeroBrandProps) {
  return (
    <div className="max-w-3xl">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">
        DN Tech<span className="text-white">.id</span>
      </p>
      <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
        {tagline}
      </h1>
      {description && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-blue-100">
          {description}
        </p>
      )}
    </div>
  );
}
