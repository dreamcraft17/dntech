import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { SectionHeading } from '@/components/homepage/SectionHeading';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface HomeFaqProps {
  items: FaqItem[];
}

export function HomeFaq({ items }: HomeFaqProps) {
  return (
    <section className="bg-white py-16" id="faq">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Pertanyaan yang Sering Ditanyakan" />
        <div className="space-y-3">
          {items.map((faq) => (
            <details
              key={faq.id}
              className="group rounded-lg border border-gray-200 open:border-blue-100"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left min-h-[48px] marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-500 transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-gray-100 px-4 py-4 text-sm leading-relaxed text-gray-600">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-gray-600">
          Masih ada pertanyaan?{' '}
          <Link href="/faq" className="font-medium text-blue-900 hover:underline">
            Lihat semua FAQ
          </Link>{' '}
          atau{' '}
          <Link href="/contact" className="font-medium text-blue-900 hover:underline">
            hubungi kami
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
