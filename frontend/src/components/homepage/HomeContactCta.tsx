import { useTranslations } from 'next-intl';
import { Mail, MessageCircle, Calendar } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { resolveCompanyPhone, whatsAppUrl } from '@/lib/contact-links';
import type { PublicSettings } from '@/lib/settings';

interface HomeContactCtaProps {
  settings: PublicSettings;
}

export function HomeContactCta({ settings }: HomeContactCtaProps) {
  const t = useTranslations('home.contactCta');
  const email = settings.companyEmail || 'info@dntech.id';
  const whatsapp = resolveCompanyPhone(settings.companyPhone);
  const linkedin = settings.socialLinks?.linkedin;
  const calendly = settings.calendlyUrl;

  return (
    <section className="dn-convert-band" aria-labelledby="home-contact-cta">
      <div className="dn-convert-band__inner hp-v5-container">
        <h2 id="home-contact-cta" className="dn-display text-white">
          {t('title')}
        </h2>
        <p>{t('body')}</p>
        <div className="dn-convert-band__actions">
          {calendly ? (
            <a
              href={calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="dn-btn-primary inline-flex min-h-11 items-center gap-2"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {t('schedule')}
            </a>
          ) : (
            <Link href="/contact" className="dn-btn-primary inline-flex min-h-11 items-center">
              {t('discussScope')}
            </Link>
          )}
          <a href={whatsAppUrl(whatsapp, t('whatsappMessage'))} className="dn-btn-ghost inline-flex min-h-11 items-center gap-2" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {t('whatsappLabel', { phone: whatsapp })}
          </a>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm text-[var(--on-primary-subtle)] sm:flex-row sm:gap-6">
          <a href={`mailto:${email}`} className="inline-flex items-center gap-2 hover:text-white">
            <Mail className="h-4 w-4" aria-hidden="true" />
            {email}
          </a>
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              LinkedIn
            </a>
          )}
          <span>
            {t('orGoTo')}{' '}
            <Link href="/contact" className="font-medium text-white underline underline-offset-2">
              {t('contactPage')}
            </Link>
          </span>
        </div>
      </div>
    </section>
  );
}
