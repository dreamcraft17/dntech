import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  hero: 96,
} as const;

export type LogoSize = keyof typeof SIZES;

interface LogoProps {
  size?: LogoSize;
  className?: string;
  href?: string | null;
  priority?: boolean;
}

export function Logo({ size = 'md', className, href = '/', priority = false }: LogoProps) {
  const dim = SIZES[size];

  const image = (
    <Image
      src="/rlogo2.png"
      alt="DN Tech — Powering Your System"
      width={dim}
      height={dim}
      priority={priority}
      className={cn('object-contain', className)}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center" aria-label="Beranda DN Tech">
        {image}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0 items-center">{image}</span>;
}
