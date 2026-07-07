'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { MultiStepForm } from '@/components/forms/MultiStepForm';

export function ExitIntentModal() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('exitIntentDismissed')) {
      setDismissed(true);
      return;
    }

    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0 && !dismissed && !show) {
        setShow(true);
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [dismissed, show]);

  function dismiss() {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem('exitIntentDismissed', '1');
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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
