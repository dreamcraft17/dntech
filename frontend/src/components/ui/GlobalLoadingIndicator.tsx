'use client';

import { useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { LOADING_END_EVENT, LOADING_START_EVENT } from '@/lib/loading-events';

export function GlobalLoadingIndicator() {
  const [visible, setVisible] = useState(false);
  const pendingRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const start = () => {
      pendingRef.current += 1;
      if (pendingRef.current === 1) {
        timerRef.current = window.setTimeout(() => setVisible(true), 180);
      }
    };
    const end = () => {
      pendingRef.current = Math.max(0, pendingRef.current - 1);
      if (pendingRef.current === 0) {
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        timerRef.current = null;
        setVisible(false);
      }
    };
    window.addEventListener(LOADING_START_EVENT, start);
    window.addEventListener(LOADING_END_EVENT, end);
    return () => {
      window.removeEventListener(LOADING_START_EVENT, start);
      window.removeEventListener(LOADING_END_EVENT, end);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90" role="status" aria-live="assertive" aria-label="Sedang memuat data">
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-md">
        <LoaderCircle className="h-6 w-6 animate-spin text-blue-900" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Memuat data...</p>
          <p className="text-xs text-gray-500">Mohon tunggu sebentar</p>
        </div>
      </div>
    </div>
  );
}
