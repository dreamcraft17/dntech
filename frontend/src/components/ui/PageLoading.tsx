import { LoaderCircle } from 'lucide-react';

export function PageLoading({
  label = 'Memuat halaman...',
  fullScreen = false,
}: {
  label?: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={fullScreen
        ? 'flex min-h-screen items-center justify-center bg-gray-50'
        : 'flex min-h-[45vh] items-center justify-center px-4 py-16'}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-100">
          <LoaderCircle className="h-7 w-7 animate-spin" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="mt-1 text-xs text-gray-500">Mohon tunggu sebentar</p>
        </div>
      </div>
    </div>
  );
}
