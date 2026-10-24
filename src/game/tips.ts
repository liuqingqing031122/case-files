// Detective's Notes: short, one-time tips attached to real controls.
// Tip progress lives in its own localStorage key, separate from the
// investigation save, and never touches game state, rules or the save format.
import { SLOT_LABELS } from './feedback';

export type NoteId =
  | 'room-search'
  | 'room-gale'
  | 'interview-ask'
  | 'interview-challenge'
  | 'casefile'
  | 'accuse';

export interface NoteContent {
  title: string;
  text: string;
}

const s = SLOT_LABELS;

export const NOTES: Record<NoteId, NoteContent> = {
  'room-search': {
    title: 'Searching a room',
    text: 'Tap a glowing point in the picture, or choose from the list. Clue cards go into your Case File; some spots are only observations.',
  },
  'room-gale': {
    title: 'Need help?',
    text: 'Ask Gale gives you a hint whenever you are stuck. How to Play, in the same panel, explains the rules.',
  },
  'interview-ask': {
    title: 'Ask about',
    text: 'Asking about a topic is free. Use it to learn what each suspect knows.',
  },
  'interview-challenge': {
    title: 'Challenge a statement',
    text: 'Present a card only when it proves a statement false. Most statements are true, and most cards are not contradictions: they are clues for your final case. A wrong challenge costs a little credibility, which only affects your rating.',
  },
  casefile: {
    title: 'Your Case File',
    text: 'Every clue and confession you find is kept here, so there is no need to memorise anything. Tap a card to read it again. Testimony cards can be presented like any other card.',
  },
  accuse: {
    title: 'Building your case',
    text: `Pick a suspect, then one card for each part: ${s.motive.title} (why), ${s.means.title} (how), ${s.opportunity.title} (when) and ${s.physical.title} (what physically links them). Each card must prove its own part, not just look suspicious. If the case is weak, Mr. Brandt names the weak parts, and you can always try again.`,
  },
};

// --- Progress (separate from the investigation save) -------------------------

export const TIPS_KEY = 'case-files.tips';
export const TIPS_VERSION = 1;

export interface TipsState {
  /** Notes the player has dismissed. */
  seen: NoteId[];
  /** "Skip tips": no automatic notes until "Show tips again". */
  off: boolean;
}

export const DEFAULT_TIPS: TipsState = { seen: [], off: false };
const ALL_IDS = Object.keys(NOTES) as NoteId[];

/** Reads tip progress. Missing, corrupted or blocked storage means "show the tips". */
export function readTips(storage: Storage | null): TipsState {
  try {
    const raw = storage?.getItem(TIPS_KEY);
    if (!raw) return DEFAULT_TIPS;
    const doc = JSON.parse(raw) as { v?: unknown; seen?: unknown; off?: unknown };
    if (doc.v !== TIPS_VERSION || !Array.isArray(doc.seen)) return DEFAULT_TIPS;
    return {
      seen: doc.seen.filter((id): id is NoteId => ALL_IDS.includes(id as NoteId)),
      off: doc.off === true,
    };
  } catch {
    return DEFAULT_TIPS;
  }
}

/** Writes tip progress. Never throws; returns false if storage refused. */
export function writeTips(storage: Storage | null, tips: TipsState): boolean {
  try {
    if (!storage) return false;
    storage.setItem(TIPS_KEY, JSON.stringify({ v: TIPS_VERSION, seen: tips.seen, off: tips.off }));
    return true;
  } catch {
    return false;
  }
}

/** The pure transitions behind "Got it", "Skip tips" and "Show tips again". */
export const markSeen = (tips: TipsState, id: NoteId): TipsState =>
  tips.seen.includes(id) ? tips : { ...tips, seen: [...tips.seen, id] };
export const skipAll = (tips: TipsState): TipsState => ({ ...tips, off: true });
export const showAgain = (): TipsState => ({ seen: [], off: false });

/** The notes still to show for a screen, in order (empty when tips are off). */
export const pendingNotes = (tips: TipsState, ids: NoteId[]): NoteId[] =>
  tips.off ? [] : ids.filter((id) => !tips.seen.includes(id));
