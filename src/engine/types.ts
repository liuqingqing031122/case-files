// Case data ("the script") and game state types.
// The engine reads a CaseData; it never refers to specific characters or items.

/**
 * A requirement for unlocking something. Every listed field must hold (AND).
 * Within a list, every id must be satisfied. Use `anyOf` for OR.
 * An empty condition `{}` is always met.
 */
export interface Condition {
  /** Evidence or testimony cards the player holds. */
  evidence?: string[];
  /** Hotspots the player has examined. */
  examined?: string[];
  /** Suspects the player has opened an interview with. */
  interviewed?: string[];
  /** Contradictions the player has broken. */
  contradictions?: string[];
  /** At least one of these sub-conditions must be met. */
  anyOf?: Condition[];
}

export type EvidenceKind = 'item' | 'testimony';

export interface EvidenceDef {
  id: string;
  name: string;
  kind: EvidenceKind;
  description: string[];
}

export interface HotspotDef {
  id: string;
  label: string;
  requires?: Condition;
  /** Evidence added to the case file when examined. */
  gives?: string[];
  /** Observation text shown when examined. */
  note?: string;
}

export interface LocationDef {
  id: string;
  name: string;
  requires?: Condition;
  hotspots: HotspotDef[];
}

export interface TopicDef {
  id: string;
  label: string;
  requires?: Condition;
  lines: string[];
  gives?: string[];
}

export interface ContradictionDef {
  id: string;
  /** Any one of these evidence ids breaks the statement. */
  accepts: string[];
  /** What the suspect says when the contradiction is exposed. */
  response: string[];
  gives?: string[];
}

export interface StatementDef {
  id: string;
  text: string;
  /** Absent for true statements: pressing them is always a wrong presentation. */
  contradiction?: ContradictionDef;
  /** Reply to a wrong presentation; falls back to the suspect's default. */
  wrongResponse?: string;
}

export interface SuspectDef {
  id: string;
  name: string;
  /** All statements are visible from the first interview (bible §5 rule). */
  statements: StatementDef[];
  topics: TopicDef[];
  defaultWrongResponse: string;
}

export type SlotId = 'motive' | 'means' | 'opportunity' | 'physical';
export const SLOT_IDS: readonly SlotId[] = ['motive', 'means', 'opportunity', 'physical'];

export interface SlotDef {
  accepts: string[];
  /** Shown when this slot is unsupported. */
  failMessage: string;
  /** Tailored messages for plausible-but-insufficient cards. */
  nearMisses?: Record<string, string>;
}

export interface AccusationDef {
  culpritId: string;
  slots: Record<SlotId, SlotDef>;
  /** Rebuttal for each innocent suspect, keyed by suspect id. */
  rebuttals: Record<string, string>;
}

export interface CaseData {
  id: string;
  title: string;
  startingEvidence: string[];
  startingCredibility: number;
  evidence: Record<string, EvidenceDef>;
  locations: LocationDef[];
  suspects: SuspectDef[];
  accusation: AccusationDef;
}

// ---------------------------------------------------------------------------
// Runtime state. Plain arrays and objects only, so it serialises to JSON
// for saving (M5).

export type RatingId = 'master' | 'chief' | 'dogged';

export interface CaseStats {
  contradictionsFound: number;
  contradictionsTotal: number;
  innocentsCleared: number;
  innocentsTotal: number;
}

export type AccusationResult =
  | { kind: 'wrongCulprit'; suspectId: string; rebuttal: string }
  | { kind: 'unproven'; failedSlots: SlotId[]; messages: Partial<Record<SlotId, string>> }
  | { kind: 'proven'; rating: RatingId; stats: CaseStats };

export interface Accusation {
  suspectId: string;
  slots: Partial<Record<SlotId, string>>;
}

/** What the last action did, so the UI can show feedback. */
export type GameEvent =
  | { kind: 'none' }
  | { kind: 'rejected'; reason: string }
  | { kind: 'examined'; hotspotId: string; gained: string[]; note?: string }
  | { kind: 'interviewOpened'; suspectId: string; firstTime: boolean }
  | { kind: 'topic'; suspectId: string; topicId: string; lines: string[]; gained: string[] }
  | { kind: 'contradiction'; contradictionId: string; response: string[]; gained: string[] }
  | { kind: 'alreadyBroken'; contradictionId: string }
  | { kind: 'wrongPress'; suspectId: string; response: string; credibility: number }
  | { kind: 'accusation'; result: AccusationResult };

export interface GameState {
  caseId: string;
  /** Held evidence and testimony, in the order found. */
  evidence: string[];
  examined: string[];
  interviewed: string[];
  /** Topic keys as `${suspectId}:${topicId}`. */
  topicsHeard: string[];
  contradictions: string[];
  credibility: number;
  wrongPresentations: number;
  failedAccusations: number;
  /** Set once the case is proven; the investigation is then closed. */
  outcome: Extract<AccusationResult, { kind: 'proven' }> | null;
  lastEvent: GameEvent;
}

export type GameAction =
  | { type: 'examine'; locationId: string; hotspotId: string }
  | { type: 'openInterview'; suspectId: string }
  | { type: 'askTopic'; suspectId: string; topicId: string }
  | { type: 'press'; suspectId: string; statementId: string; evidenceId: string }
  | { type: 'accuse'; accusation: Accusation }
  | { type: 'reset' };
