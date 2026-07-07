'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useExitIntent } from '@/hooks/useExitIntent';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function ExitIntentModal() {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { showModal, dismiss } = useExitIntent({
    onExit: () => {
      window.gtag?.('event', 'exit_intent_shown');
    },
    debug: process.env.NODE_ENV === 'development',
  });

  useEffect(() => {
    if (showModal) closeButtonRef.current?.focus();
  }, [showModal]);

  if (!showModal) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/50"
        onClick={dismiss}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-md rounded-lg bg-white p-8 pt-12 shadow-2xl pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-modal-title"
        >
          <button
            ref={closeButtonRef}
            onClick={dismiss}
            className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>

          <h2 id="exit-modal-title" className="mb-4 pr-8 text-2xl font-bold text-blue-900">
            Tunggu! Sebelum Anda pergi...
          </h2>

          <p className="mb-6 text-sm leading-relaxed text-gray-600">
            Jangan lewatkan kesempatan untuk mendiskusikan proyek Anda bersama tim DN Tech.
            Hubungi kami hari ini untuk konsultasi gratis.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={dismiss}
              className="flex-1 rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-200"
            >
              Tidak, terima kasih
            </button>

            <Link
              href="/contact"
              onClick={dismiss}
              className="flex-1 rounded-lg bg-blue-900 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-blue-800"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
