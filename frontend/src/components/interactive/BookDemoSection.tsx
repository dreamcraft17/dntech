import { CalendlyEmbed } from '@/components/interactive/CalendlyEmbed';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Calendar, ArrowRight } from 'lucide-react';

interface BookDemoSectionProps {
  calendlyUrl?: string;
}

export function BookDemoSection({ calendlyUrl }: BookDemoSectionProps) {
  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 mb-4">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Book a Free Consultation</h2>
          <p className="mt-3 text-slate-600 max-w-xl mx-auto">
            Schedule a 30-minute call with our experts. No commitment — just a conversation about your goals.
          </p>
        </div>

        {calendlyUrl ? (
          <CalendlyEmbed url={calendlyUrl} />
        ) : (
          <div className="text-center p-8 rounded-xl bg-white border border-slate-200">
            <p className="text-slate-600 mb-6">Pick a time that works for you, or send us a message.</p>
            <Link href="/contact">
              <Button size="lg">
                Request a Demo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
