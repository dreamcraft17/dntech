'use client';

interface TrendBarsProps {
  data: [string, number][];
  barColor?: string;
  formatLabel?: (day: string) => string;
}

const DEFAULT_FORMAT = (day: string) => {
  const d = new Date(day);
  if (Number.isNaN(d.getTime())) return day;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
};

export function TrendBars({ data, barColor = 'bg-blue-900', formatLabel = DEFAULT_FORMAT }: TrendBarsProps) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-500">Belum ada data.</p>;
  }

  const max = Math.max(...data.map(([, v]) => v), 1);

  return (
    <div className="flex items-end gap-0.5 h-24">
      {data.map(([day, count]) => (
        <div key={day} className="group relative flex-1">
          <div
            className={`w-full rounded-t transition-colors hover:opacity-80 ${barColor}`}
            style={{ height: `${Math.max((count / max) * 100, 4)}%` }}
          />
          <div className="absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-1.5 py-0.5 text-xs text-white group-hover:block">
            {formatLabel(day)}: {count}
          </div>
        </div>
      ))}
    </div>
  );
}
