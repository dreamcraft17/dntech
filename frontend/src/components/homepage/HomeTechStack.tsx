import { SectionHeading } from '@/components/homepage/SectionHeading';
import type { HomeTechCategory } from '@/lib/homepage-content';

interface HomeTechStackProps {
  categories: HomeTechCategory[];
}

export function HomeTechStack({ categories }: HomeTechStackProps) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Teknologi yang Kami Gunakan"
          subtitle="Stack modern, scalable, dan teruji untuk produk yang siap grow"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.category} className="rounded-lg border border-gray-200 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-900">
                {cat.category}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                {cat.items.join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
