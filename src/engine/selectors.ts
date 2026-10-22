// Read-only questions about the game: condition checks and lookups.
// The UI and the reducer both use these, so unlock rules live in one place.
import type {
  CaseData,
  Condition,
  GameState,
  HotspotDef,
  LocationDef,
  StatementDef,
  SuspectDef,
  TopicDef,
} from './types';

const allIn = (ids: string[] | undefined, held: string[]) =>
  (ids ?? []).every((id) => held.includes(id));

/** The single unlock rule: does the state satisfy this condition? */
export function isMet(condition: Condition | undefined, state: GameState): boolean {
  if (!condition) return true;
  return (
    allIn(condition.evidence, state.evidence) &&
    allIn(condition.examined, state.examined) &&
    allIn(condition.interviewed, state.interviewed) &&
    allIn(condition.contradictions, state.contradictions) &&
    (!condition.anyOf || condition.anyOf.some((c) => isMet(c, state)))
  );
}

export const topicKey = (suspectId: string, topicId: string) => `${suspectId}:${topicId}`;

export const hasEvidence = (state: GameState, id: string) => state.evidence.includes(id);

export const findLocation = (data: CaseData, id: string): LocationDef | undefined =>
  data.locations.find((l) => l.id === id);

export const findSuspect = (data: CaseData, id: string): SuspectDef | undefined =>
  data.suspects.find((s) => s.id === id);

export const findHotspot = (location: LocationDef, id: string): HotspotDef | undefined =>
  location.hotspots.find((h) => h.id === id);

export const findTopic = (suspect: SuspectDef, id: string): TopicDef | undefined =>
  suspect.topics.find((t) => t.id === id);

export const findStatement = (suspect: SuspectDef, id: string): StatementDef | undefined =>
  suspect.statements.find((s) => s.id === id);

export const openLocations = (data: CaseData, state: GameState): LocationDef[] =>
  data.locations.filter((l) => isMet(l.requires, state));

export const visibleHotspots = (location: LocationDef, state: GameState): HotspotDef[] =>
  location.hotspots.filter((h) => isMet(h.requires, state));

export const availableTopics = (suspect: SuspectDef, state: GameState): TopicDef[] =>
  suspect.topics.filter((t) => isMet(t.requires, state));

/** Every contradiction defined in the case, with the suspect it belongs to. */
export function allContradictions(data: CaseData) {
  return data.suspects.flatMap((suspect) =>
    suspect.statements.flatMap((statement) =>
      statement.contradiction ? [{ suspect, statement, contradiction: statement.contradiction }] : [],
    ),
  );
}
