import { useState } from 'react';
import { useGame } from './GameContext';
import { pendingNotes, type NoteId } from './tips';

/**
 * The Detective's Notes still to show on this screen, in order. The list is
 * taken when the screen opens, so "Show tips again" (from the Guide) only
 * affects future visits and never changes the screen already on display.
 */
export function useNotes(ids: NoteId[]) {
  const { tips, markTipSeen, skipTips } = useGame();
  const [queue, setQueue] = useState<NoteId[]>(() => pendingNotes(tips, ids));

  return {
    /** The next note in line (shown only if its target is currently usable). */
    next: queue[0] as NoteId | undefined,
    /** "1 of 2" for screens with more than one note. */
    position: (id: NoteId) => ({ step: ids.indexOf(id) + 1, of: ids.length }),
    /** "Got it": dismiss this note for good. */
    dismiss: (id: NoteId) => {
      markTipSeen(id);
      setQueue((q) => q.filter((x) => x !== id));
    },
    /** "Skip tips": no more automatic notes, here or anywhere. */
    skip: () => {
      skipTips();
      setQueue([]);
    },
  };
}
