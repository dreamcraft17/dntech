'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { MultiStepForm } from '@/components/forms/MultiStepForm';

/** Minimal waktu di halaman sebelum exit-intent aktif */
const MIN_DWELL_MS = 8000;
/** Kursor harus pernah masuk ke area konten (bukan tepi atas) */
const ENGAGE_Y = 80;
/** Trigger hanya saat kursor mendekati tab bar / address bar */
const EXIT_Y = 5;

export function ExitIntentModal() {
  const [show, setShow] = useState(false);
  const enabledRef = useRef(false);
  const engagedRef = useRef(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('exitIntentDismissed')) return;

    // Skip perangkat sentuh — tidak ada exit intent via mouse
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dwellTimer = window.setTimeout(() => {
      enabledRef.current = true;
    }, MIN_DWELL_MS);

    function markEngaged(e: MouseEvent) {
      if (e.clientY >= ENGAGE_Y) engagedRef.current = true;
    }

    function handleMouseOut(e: MouseEvent) {
      if (!enabledRef.current || !engagedRef.current || triggeredRef.current) return;

      // Keluar ke browser chrome (tab bar, address bar, dll.)
      const exitingViaTop = e.clientY <= EXIT_Y && !e.relatedTarget;
      if (exitingViaTop) {
        triggeredRef.current = true;
        setShow(true);
      }
    }

    document.addEventListener('mousemove', markEngaged, { passive: true });
    document.documentElement.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.clearTimeout(dwellTimer);
      document.removeEventListener('mousemove', markEngaged);
      document.documentElement.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  function dismiss() {
    setShow(false);
    sessionStorage.setItem('exitIntentDismissed', '1');
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={dismiss} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600" aria-label="Tutup">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 pr-8">Tunggu! Sebelum Anda pergi...</h2>
        <p className="mt-2 text-sm text-slate-600">
          Dapatkan konsultasi gratis dengan tim ahli kami. Ceritakan proyek Anda dan kami akan merespons dalam 24 jam.
        </p>
        <div className="mt-6">
          <MultiStepForm source="exit-intent" pageSource={typeof window !== 'undefined' ? window.location.pathname : '/'} />
        </div>
      </div>
    </div>
  );
}
