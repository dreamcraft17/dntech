'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useExitIntent } from '@/hooks/useExitIntent';
import { Modal, ModalActions } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function ExitIntentModal() {
  const primaryButtonRef = useRef<HTMLAnchorElement>(null);
  const { showModal, dismiss } = useExitIntent({
    onExit: () => {
      window.gtag?.('event', 'exit_intent_shown');
    },
    debug: process.env.NODE_ENV === 'development',
  });

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
        <Link href="/contact" onClick={dismiss} ref={primaryButtonRef}>
          <Button>Hubungi Kami</Button>
        </Link>
      </ModalActions>
    </Modal>
  );
}
