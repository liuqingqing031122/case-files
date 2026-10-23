// Player-facing interview status. Derived from game state for display only;
// the engine's `interviewed` rule (which drives room unlocks) is unchanged.
import { availableTopics, topicKey, type GameState, type SuspectDef } from '../engine';

export type InterviewStatus = 'notQuestioned' | 'moreToAsk' | 'nothingMore';

export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  notQuestioned: 'Not yet questioned',
  moreToAsk: 'More to ask',
  nothingMore: 'Nothing more to ask, for now',
};

/**
 * Only topics the player can currently see are considered, so the status never
 * hints at locked topics. When a new topic unlocks, the status returns to
 * "More to ask".
 */
export function interviewStatus(suspect: SuspectDef, state: GameState): InterviewStatus {
  if (!state.interviewed.includes(suspect.id)) return 'notQuestioned';
  const unasked = availableTopics(suspect, state).some(
    (t) => !state.topicsHeard.includes(topicKey(suspect.id, t.id)),
  );
  return unasked ? 'moreToAsk' : 'nothingMore';
}
