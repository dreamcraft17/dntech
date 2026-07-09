import { Logo, type LogoSize } from '@/components/common/Logo';

interface LogoDarkProps {
  className?: string;
  size?: LogoSize;
}

/** Footer, hero, and dark backgrounds */
export function LogoDark({ className, size = 'lg' }: LogoDarkProps) {
  return <Logo href={null} size={size} className={className} />;
}

export default LogoDark;
