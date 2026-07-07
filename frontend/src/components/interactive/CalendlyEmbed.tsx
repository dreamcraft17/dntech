'use client';

interface CalendlyEmbedProps {
  url?: string;
}

export function CalendlyEmbed({ url }: CalendlyEmbedProps) {
  if (!url) return null;

  return (
    <div className="mt-8 rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900 text-sm">Or schedule a call directly</h3>
      </div>
      <iframe
        src={url}
        title="Schedule a meeting"
        className="w-full h-[600px] border-0"
        loading="lazy"
      />
    </div>
  );
}
