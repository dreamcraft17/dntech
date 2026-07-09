import { Logo, type LogoSize } from '@/components/common/Logo';

interface LogoDarkProps {
  className?: string;
  size?: LogoSize;
}

/** Dark backgrounds (e.g. admin chrome) — use sm/md; avoid large logo on dark blocks */
export function LogoDark({ className, size = 'md' }: LogoDarkProps) {
  return <Logo href={null} size={size} className={className} />;
}

export default LogoDark;
