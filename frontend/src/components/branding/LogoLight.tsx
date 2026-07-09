import { Logo, type LogoSize } from '@/components/common/Logo';

interface LogoLightProps {
  className?: string;
  size?: LogoSize;
}

/** Navbar / light backgrounds */
export function LogoLight({ className, size = 'md' }: LogoLightProps) {
  return <Logo href={null} size={size} className={className} priority />;
}

export default LogoLight;
