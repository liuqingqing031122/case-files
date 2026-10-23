import { useEffect, useRef } from 'react';

/**
 * Shared modal behaviour: Escape closes, the page behind stops scrolling, and
 * focus moves to the dialog itself *without* scrolling it, so the dialog
 * always opens with its beginning in view.
 */
export function useModal<T extends HTMLElement>(onClose: () => void) {
  const dialogRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    dialogRef.current?.focus({ preventScroll: true });
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return dialogRef;
}
