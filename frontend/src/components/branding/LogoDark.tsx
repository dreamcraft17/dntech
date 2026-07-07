interface LogoDarkProps {
  className?: string;
}

export function LogoDark({ className = '' }: LogoDarkProps) {
  return (
    <div
      className={`flex items-center gap-2 font-bold text-lg text-white ${className}`}
      aria-label="DN Tech - Custom Software Development"
    >
      <div
        className="w-8 h-8 bg-white rounded-md flex items-center justify-center flex-shrink-0"
        aria-hidden="true"
      >
        <span className="text-blue-900 text-xs font-bold leading-none">DN</span>
      </div>
      <span className="hidden sm:inline">DN Tech</span>
    </div>
  );
}

export default LogoDark;
