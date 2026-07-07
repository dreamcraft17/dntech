interface ClientLogosProps {
  logos?: { name: string; initial?: string }[];
}

export function ClientLogos({ logos }: ClientLogosProps) {
  const items = Array.isArray(logos) ? logos.filter((l) => l.name) : [];
  if (!items.length) return null;

  return (
    <section className="py-10 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-slate-500 mb-6">Dipercaya perusahaan terkemuka di seluruh Indonesia</p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {items.map((logo) => (
            <div key={logo.name} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-slate-50">
              <div className="h-8 w-8 rounded bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                {logo.initial || logo.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-slate-600">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
