// Accusation evaluation (bible §8): naming the culprit is not enough,
// every slot must be supported by an accepted card.
import { allContradictions } from './selectors';
import {
  SLOT_IDS,
  type Accusation,
  type AccusationResult,
  type CaseData,
  type CaseStats,
  type GameState,
  type RatingId,
  type SlotId,
} from './types';

export const MASTER_MIN_CREDIBILITY = 4;
export const CHIEF_MAX_FAILED = 1;

export function caseStats(data: CaseData, state: GameState): CaseStats {
  const all = allContradictions(data);
  const innocents = data.suspects.filter(
    (s) => s.id !== data.accusation.culpritId && s.statements.some((st) => st.contradiction),
  );
  // An innocent is "cleared" once every one of their lies has been exposed.
  const cleared = innocents.filter((s) =>
    s.statements.every(
      (st) => !st.contradiction || state.contradictions.includes(st.contradiction.id),
    ),
  );
  return {
    contradictionsFound: all.filter((c) => state.contradictions.includes(c.contradiction.id)).length,
    contradictionsTotal: all.length,
    innocentsCleared: cleared.length,
    innocentsTotal: innocents.length,
  };
}

/** Rating for a proven case, from submissions that failed before this one. */
export function rate(failedAccusations: number, credibility: number): RatingId {
  if (failedAccusations === 0 && credibility >= MASTER_MIN_CREDIBILITY) return 'master';
  if (failedAccusations <= CHIEF_MAX_FAILED) return 'chief';
  return 'dogged';
}

/**
 * Judge an accusation. Pure: it does not apply penalties. The caller is
 * expected to have checked that every submitted card is held.
 */
export function evaluateAccusation(
  data: CaseData,
  state: GameState,
  accusation: Accusation,
): AccusationResult {
  const { culpritId, slots, rebuttals } = data.accusation;

  if (accusation.suspectId !== culpritId) {
    return {
      kind: 'wrongCulprit',
      suspectId: accusation.suspectId,
      rebuttal: rebuttals[accusation.suspectId] ?? 'The evidence does not point that way.',
    };
  }

  const failedSlots: SlotId[] = [];
  const messages: Partial<Record<SlotId, string>> = {};
  for (const slot of SLOT_IDS) {
    const card = accusation.slots[slot];
    const def = slots[slot];
    if (card && def.accepts.includes(card)) continue;
    failedSlots.push(slot);
    messages[slot] = (card && def.nearMisses?.[card]) || def.failMessage;
  }

  if (failedSlots.length > 0) return { kind: 'unproven', failedSlots, messages };

  return {
    kind: 'proven',
    rating: rate(state.failedAccusations, state.credibility),
    stats: caseStats(data, state),
  };
}
