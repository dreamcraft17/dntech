import Link from 'next/link';
import { CONTENT_PILLARS } from '@/lib/content-pillars';

export function ContentPillars() {
  return (
    <section className="mb-12">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Resources</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">Jelajahi berdasarkan topik</h2>
        </div>
        <span className="hidden text-sm text-slate-500 sm:block">Pilih konteks yang paling relevan</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CONTENT_PILLARS.map((pillar) => (
          <Link key={pillar.id} href={pillar.href}
            className="group border border-slate-200 bg-white p-4 transition-colors hover:border-blue-900 hover:bg-blue-50">
            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">{pillar.label}</div>
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{pillar.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
