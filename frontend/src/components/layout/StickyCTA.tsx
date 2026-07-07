'use client';

import Link from 'next/link';

export function StickyCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-blue-600 px-4 py-3 shadow-lg border-t border-blue-700">
      <Link href="/contact"
        className="flex items-center justify-center w-full py-2.5 text-sm font-semibold text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors">
        Request Free Demo
      </Link>
    </div>
  );
}
