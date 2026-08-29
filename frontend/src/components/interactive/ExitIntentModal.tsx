'use client';

import { useEffect, useRef } from 'react';
import { useExitIntent } from '@/hooks/useExitIntent';
import { Modal, ModalActions } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface ExitIntentModalProps {
  /** When true, show immediately on mount (used after deferred load on exit intent). */
  autoShow?: boolean;
}

export function ExitIntentModal({ autoShow = false }: ExitIntentModalProps) {
  const primaryButtonRef = useRef<HTMLAnchorElement>(null);
  const { showModal, dismiss, setShowModal } = useExitIntent({
    debug: process.env.NODE_ENV === 'development',
    skipListener: autoShow,
  });

  useEffect(() => {
    if (!autoShow) return;
    sessionStorage.setItem('exitIntentModalShown', 'true');
    setShowModal(true);
    window.gtag?.('event', 'exit_intent_shown');
  }, [autoShow, setShowModal]);

  useEffect(() => {
    if (showModal) primaryButtonRef.current?.focus();
  }, [showModal]);

  return (
    <Modal open={showModal} onClose={dismiss} title="Tunggu! Sebelum Anda pergi..." className="max-w-md">
      <p className="text-sm leading-relaxed text-gray-600">
        Jangan lewatkan kesempatan untuk mendiskusikan proyek Anda bersama tim DN Tech.
        Hubungi kami hari ini untuk konsultasi gratis.
      </p>
      <ModalActions>
        <Button variant="ghost" onClick={dismiss}>
          Tidak, terima kasih
        </Button>
        <Button href="/contact" onClick={dismiss} ref={primaryButtonRef}>
          Hubungi Kami
        </Button>
      </ModalActions>
    </Modal>
  );
}
