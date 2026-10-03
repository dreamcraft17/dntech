import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface InternalLink {
  href: string;
  label: string;
}

interface InternalLinksProps {
  title?: string;
  description?: string;
  links: InternalLink[];
}

export function InternalLinks({ title, description, links }: InternalLinksProps) {
  const t = useTranslations('interactive.internalLinks');
  const heading = title ?? t('defaultTitle');

  if (!links.length) return null;

  return (
    <nav aria-label={heading} className="saas-panel rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900">{heading}</h3>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      <ul className="mt-4 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}
              className="flex items-center justify-between text-sm text-blue-900 font-medium hover:underline group">
              {link.label}
              <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
