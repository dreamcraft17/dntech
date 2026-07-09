import Link from 'next/link';
import { Logo } from '@/components/common/Logo';

/** Footer wordmark — small logo + text, no large circular asset */
export function FooterBrand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity"
      aria-label="Beranda DN Tech"
    >
      <Logo href={null} size="sm" />
      <span className="font-bold text-gray-900 text-base leading-tight tracking-tight">
        DN Tech<span className="text-blue-900">.id</span>
      </span>
    </Link>
  );
}
