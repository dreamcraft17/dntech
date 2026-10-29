import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/navigation';
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
  const t = useTranslations('home.faq');
  return (
    <section className="hp-v5-section" id="faq">
      <div className="hp-v5-container max-w-3xl">
        <SectionHeading kicker={t('kicker')} title={t('title')} className="mb-8" />
        <div className="space-y-0 border border-[var(--border-strong)]">
          {items.map((faq) => (
            <details
              key={faq.id}
              className="group border-b border-[var(--border-strong)] bg-[var(--surface)] last:border-b-0"
            >
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="font-medium text-[var(--foreground)]">{faq.question}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-[var(--muted)] transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-[var(--border)] px-4 py-4 text-sm leading-relaxed text-[var(--muted)]">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
        <p className="mt-8 text-sm text-[var(--muted)]">
          {t('moreQuestions')}{' '}
          <Link href="/faq" className="font-semibold text-[var(--primary)] hover:underline">
            {t('allFaqLink')}
          </Link>{' '}
          {t('or')}{' '}
          <Link href="/contact" className="font-semibold text-[var(--primary)] hover:underline">
            {t('contactLink')}
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
