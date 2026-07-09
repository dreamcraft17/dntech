import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface InternalLink {
  href: string;
  label: string;
}

interface InternalLinksProps {
  title?: string;
  description?: string;
  links: InternalLink[];
}

export function InternalLinks({ title = 'Jelajahi Terkait', description, links }: InternalLinksProps) {
  if (!links.length) return null;

  return (
    <nav aria-label={title} className="p-6 rounded-xl bg-gray-50 border border-gray-200">
      <h3 className="font-semibold text-gray-900">{title}</h3>
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
