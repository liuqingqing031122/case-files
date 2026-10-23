import { useEffect, useRef } from 'react';

/**
 * Focuses an element when the screen mounts, like `autoFocus`, but without
 * scrolling it into view. `autoFocus` scrolls to the focused button, which
 * skipped past the start of long screens such as the briefing.
 */
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return ref;
}
