'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseExitIntentOptions {
  onExit?: () => void;
  enableMobile?: boolean;
  debug?: boolean;
  sessionKey?: string;
  /** Skip attaching mouseleave listener (modal shown programmatically). */
  skipListener?: boolean;
}

const DEFAULT_SESSION_KEY = 'exitIntentModalShown';

export function useExitIntent(options: UseExitIntentOptions = {}) {
  const {
    onExit,
    enableMobile = false,
    debug = false,
    sessionKey = DEFAULT_SESSION_KEY,
    skipListener = false,
  } = options;
  const [showModal, setShowModal] = useState(false);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const onExitRef = useRef(onExit);

  useEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);

  const dismiss = useCallback(() => {
    setShowModal(false);

    window.setTimeout(() => {
      lastFocusedElementRef.current?.focus();
    }, 0);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (skipListener) return;
    if (process.env.NEXT_PUBLIC_ENABLE_EXIT_MODAL === 'false') return;

    const isMobile =
      window.matchMedia('(max-width: 1024px)').matches ||
      window.matchMedia('(pointer: coarse)').matches;

    if (isMobile && !enableMobile) {
      if (debug) console.log('[ExitIntent] Mobile device, skipping');
      return;
    }

    if (sessionStorage.getItem(sessionKey) === 'true') {
      if (debug) console.log('[ExitIntent] Already shown in this session');
      return;
    }

    function markShown() {
      sessionStorage.setItem(sessionKey, 'true');
    }

    function triggerModal() {
      if (sessionStorage.getItem(sessionKey) === 'true') return;

      lastFocusedElementRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      markShown();
      setShowModal(true);
      onExitRef.current?.();
    }

    function handleMouseLeaveTop(e: MouseEvent) {
      if (e.clientY <= 0) {
        if (debug) console.log('[ExitIntent] Mouse left viewport top');
        triggerModal();
      }
    }

    function handleBeforeUnload() {
      if (debug) console.log('[ExitIntent] beforeunload event triggered');
      markShown();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        if (debug) console.log('[ExitIntent] document hidden');
        markShown();
      }
    }

    document.addEventListener('mouseleave', handleMouseLeaveTop);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeaveTop);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [debug, enableMobile, sessionKey, skipListener]);

  return {
    showModal,
    dismiss,
    setShowModal,
  };
}
