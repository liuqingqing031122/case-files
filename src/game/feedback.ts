// Turns engine results into player-facing feedback. Pure functions, no React,
// so the wording rules are unit-tested.
import type { AccusationResult, CaseData, EvidenceDef, GameEvent, RatingId, SlotId, TopicDef } from '../engine';
import { CHIEF_MAX_FAILED, MASTER_MIN_CREDIBILITY } from '../engine/accusation';

export type Tone = 'success' | 'fail' | 'neutral';

export interface Feedback {
  tone: Tone;
  heading: string;
  lines: string[];
  /** Cards added to the case file by this action. */
  gained: EvidenceDef[];
  /** Short note about credibility, when it changed. */
  credibilityNote?: string;
  /** Topics this suspect can now be asked about (after a contradiction). */
  newTopics?: TopicDef[];
}

export const SLOT_LABELS: Record<SlotId, { title: string; question: string }> = {
  motive: { title: 'Motive', question: 'Why would they do it?' },
  means: { title: 'Means', question: 'How did they get the poison?' },
  opportunity: { title: 'Opportunity', question: 'When could they have done it?' },
  physical: { title: 'Physical Evidence', question: 'What physically ties them to it?' },
};

export const RATING_LABELS: Record<RatingId, string> = {
  master: 'Master Detective',
  chief: 'Chief Inspector Material',
  dogged: 'Dogged Detective',
};

/** How ratings are earned, built from the engine's own thresholds. */
export const RATING_CRITERIA = `${RATING_LABELS.master}: proven at the first attempt, with credibility of ${MASTER_MIN_CREDIBILITY} or more. ${RATING_LABELS.chief}: no more than ${CHIEF_MAX_FAILED} failed accusation. ${RATING_LABELS.dogged}: proven after more attempts.`;

const cards = (data: CaseData, ids: string[]) => ids.map((id) => data.evidence[id]).filter(Boolean);

/** Feedback for presenting evidence against a statement. */
export function pressFeedback(
  data: CaseData,
  event: GameEvent,
  maxCredibility: number,
  newTopics: TopicDef[] = [],
): Feedback | null {
  switch (event.kind) {
    case 'contradiction':
      return {
        tone: 'success',
        heading: 'Contradiction!',
        lines: event.response,
        gained: cards(data, event.gained),
        newTopics,
      };
    case 'wrongPress':
      return {
        tone: 'fail',
        heading: "That doesn't contradict it",
        lines: [event.response],
        gained: [],
        credibilityNote: `Credibility −1 (${event.credibility}/${maxCredibility})`,
      };
    case 'alreadyBroken':
      return {
        tone: 'neutral',
        heading: 'Already exposed',
        lines: ['You have already caught this lie. No need to press it again.'],
        gained: [],
      };
    case 'rejected':
      return { tone: 'neutral', heading: 'Not possible', lines: [event.reason], gained: [] };
    default:
      return null;
  }
}

/** Feedback for asking about a topic. */
export function topicFeedback(data: CaseData, event: GameEvent, label: string): Feedback | null {
  if (event.kind !== 'topic') return null;
  return { tone: 'neutral', heading: label, lines: event.lines, gained: cards(data, event.gained) };
}

/** Feedback for a failed or successful accusation. */
export function accusationFeedback(result: AccusationResult, maxCredibility: number, credibility: number): Feedback {
  const credibilityNote = `Credibility −1 (${credibility}/${maxCredibility}). The case stays open.`;
  switch (result.kind) {
    case 'wrongCulprit':
      return {
        tone: 'fail',
        heading: 'Mr. Brandt is not convinced',
        lines: [result.rebuttal],
        gained: [],
        credibilityNote,
      };
    case 'unproven':
      return {
        tone: 'fail',
        heading: "It won't stand up",
        lines: result.failedSlots.map((slot) => `${SLOT_LABELS[slot].title}: ${result.messages[slot]}`),
        gained: [],
        credibilityNote,
      };
    case 'proven':
      return { tone: 'success', heading: 'Case proven', lines: [RATING_LABELS[result.rating]], gained: [] };
  }
}
