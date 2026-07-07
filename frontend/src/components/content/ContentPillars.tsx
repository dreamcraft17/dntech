import Link from 'next/link';
import { CONTENT_PILLARS } from '@/lib/content-pillars';

export function ContentPillars() {
  return (
    <section className="mb-12">
      <h2 className="text-lg font-semibold text-slate-900 mb-4 text-center">Jelajahi Berdasarkan Topik</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CONTENT_PILLARS.map((pillar) => (
          <Link key={pillar.id} href={pillar.href}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group">
            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">{pillar.label}</div>
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">{pillar.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
