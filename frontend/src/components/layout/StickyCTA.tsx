'use client';

import Link from 'next/link';

export function StickyCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-blue-900 px-4 py-3 border-t border-blue-800">
      <Link
        href="/contact"
        className="flex items-center justify-center w-full py-3 text-sm font-semibold text-blue-900 bg-white rounded-lg hover:bg-gray-100 transition-colors min-h-[48px]"
      >
        Konsultasi Gratis
      </Link>
    </div>
  );
}
