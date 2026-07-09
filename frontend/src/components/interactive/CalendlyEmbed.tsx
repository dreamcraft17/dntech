'use client';

interface CalendlyEmbedProps {
  url?: string;
}

export function CalendlyEmbed({ url }: CalendlyEmbedProps) {
  if (!url) return null;

  return (
    <div className="mt-8 rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 text-sm">Atau jadwalkan panggilan langsung</h3>
      </div>
      <iframe
        src={url}
        title="Jadwalkan pertemuan"
        className="w-full h-[600px] border-0"
        loading="lazy"
      />
    </div>
  );
}
