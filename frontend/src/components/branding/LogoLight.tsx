import { Logo, type LogoSize } from '@/components/common/Logo';
import { cn } from '@/lib/utils';

interface LogoLightProps {
  className?: string;
  size?: LogoSize;
}

/** Navbar / light backgrounds */
export function LogoLight({ className, size = 'md' }: LogoLightProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Logo href={null} size={size} priority />
      <span className="font-bold text-blue-900 text-base sm:text-lg leading-tight tracking-tight">
        DN Tech<span className="text-blue-700">.id</span>
      </span>
    </span>
  );
}

export default LogoLight;
