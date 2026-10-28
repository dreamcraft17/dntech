import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function PageBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const t = useTranslations('layout');

  return (
    <nav className="dn-crumb" aria-label={t('breadcrumbAria')}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`}>
            {index > 0 && <span className="mx-2 opacity-50">/</span>}
            {item.href && !isLast ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span className={isLast ? 'text-[var(--foreground)]' : undefined}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
