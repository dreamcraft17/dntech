interface LogoLightProps {
  className?: string;
}

export function LogoLight({ className = '' }: LogoLightProps) {
  return (
    <div
      className={`flex items-center gap-2 font-bold text-lg text-blue-900 ${className}`}
      aria-label="DN Tech - Custom Software Development"
    >
      <div
        className="w-8 h-8 bg-blue-900 rounded-md flex items-center justify-center flex-shrink-0"
        aria-hidden="true"
      >
        <span className="text-white text-xs font-bold leading-none">DN</span>
      </div>
      <span className="hidden sm:inline">DN Tech</span>
    </div>
  );
}

export default LogoLight;
