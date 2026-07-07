'use client';

interface FunnelStep {
  label: string;
  value: number;
}

interface ConversionChartProps {
  funnel: FunnelStep[];
  monthTrend?: [string, number][];
}

export function ConversionChart({ funnel, monthTrend }: ConversionChartProps) {
  const maxFunnel = Math.max(...funnel.map((f) => f.value), 1);
  const maxTrend = monthTrend?.length ? Math.max(...monthTrend.map(([, v]) => v), 1) : 1;

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-4">Corong Konversi</h4>
        <div className="space-y-3">
          {funnel.map(({ label, value }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">{label}</span>
                <span className="font-medium text-slate-900">{value.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${Math.max((value / maxFunnel) * 100, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {monthTrend && monthTrend.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-4">Tren Lead (30 hari)</h4>
          <div className="flex items-end gap-0.5 h-24">
            {monthTrend.map(([day, count]) => (
              <div key={day} className="flex-1 group relative">
                <div
                  className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                  style={{ height: `${Math.max((count / maxTrend) * 100, 4)}%` }}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block text-xs bg-slate-800 text-white px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                  {day}: {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
