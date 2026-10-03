'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('interactive.exitIntent');
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
    <Modal
      open={showModal}
      onClose={dismiss}
      title={t('title')}
      closeLabel={t('close')}
      className="max-w-md"
    >
      <p className="text-sm leading-relaxed text-gray-600">{t('body')}</p>
      <ModalActions>
        <Button variant="ghost" onClick={dismiss}>
          {t('dismiss')}
        </Button>
        <Button href="/contact" onClick={dismiss} ref={primaryButtonRef}>
          {t('cta')}
        </Button>
      </ModalActions>
    </Modal>
  );
}
