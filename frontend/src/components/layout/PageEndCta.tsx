import { useTranslations } from 'next-intl';
import { PublicPageCta } from '@/components/layout/PublicPageShell';

/** Shared Mekari-style conversion band for catalog / proof pages. */
export function PageEndCta() {
  const t = useTranslations('layout.pageEndCta');

  return (
    <PublicPageCta
      title={t('title')}
      description={t('description')}
      primaryHref="/contact"
      primaryLabel={t('primary')}
      secondaryHref="/quiz"
      secondaryLabel={t('secondary')}
    />
  );
}
