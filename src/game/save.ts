// Saving and loading (M5). Pure TypeScript, no React, so every rule is unit-tested.
//
// Safety rules:
// - Loading never throws. Bad or incompatible data reads as "unreadable".
// - Storage access is always wrapped: private mode or a full disk only
//   disables saving, never the game.
// - Autosave is off until the player explicitly continues or starts a new
//   game, so the blank start-up state can never overwrite an existing save.
import { findSuspect, isMet, topicKey, type CaseData, type GameState, type RatingId } from '../engine';
import type { ResumeView, View } from './view';

export const SAVE_FORMAT = 'case-files-save';
export const SAVE_VERSION = 1;
export const saveKey = (caseId: string) => `case-files.save.${caseId}`;

/** Engine progress as stored. `lastEvent` is UI feedback and is not saved. */
export type SavedGame = Omit<GameState, 'lastEvent'>;

export interface SaveUi {
  hintTiers: Record<string, number>;
  galeOpened: boolean;
  view: ResumeView;
}

export interface SaveFile {
  format: typeof SAVE_FORMAT;
  version: number;
  caseId: string;
  savedAt: string;
  game: SavedGame;
  ui: SaveUi;
}

export interface LoadedSave {
  state: GameState;
  ui: SaveUi;
  savedAt: string;
}

export type ReadResult =
  | { status: 'none' }
  | { status: 'valid'; save: LoadedSave }
  | { status: 'unreadable'; reason: string };

/**
 * Upgrades older save versions, keyed by the version they upgrade *from*.
 * Empty for now: when the save shape changes, bump SAVE_VERSION and add a step.
 */
export const MIGRATIONS: Record<number, (old: Record<string, unknown>) => Record<string, unknown>> = {};

// ---------------------------------------------------------------------------
// Progress and resume screen

/** True once the player has done anything worth saving. */
export function hasProgress(state: GameState): boolean {
  return (
    state.examined.length > 0 ||
    state.interviewed.length > 0 ||
    state.topicsHeard.length > 0 ||
    state.contradictions.length > 0 ||
    state.wrongPresentations > 0 ||
    state.failedAccusations > 0 ||
    state.outcome !== null
  );
}

/** Where Continue should land: the saved screen if still valid, else Rooms. */
export function resumeView(data: CaseData, state: GameState, view: ResumeView): View {
  if (state.outcome) return { name: 'ending' };
  switch (view.name) {
    case 'location': {
      const location = data.locations.find((l) => l.id === view.id);
      return location && isMet(location.requires, state) ? view : { name: 'rooms' };
    }
    case 'interview':
      return findSuspect(data, view.id) ? view : { name: 'rooms' };
    default:
      return view;
  }
}

// ---------------------------------------------------------------------------
// Writing

export function serializeSave(data: CaseData, state: GameState, ui: SaveUi, now = new Date()): SaveFile {
  // Drop lastEvent without listing every other field.
  const { lastEvent: _lastEvent, ...game } = state;
  void _lastEvent;
  return { format: SAVE_FORMAT, version: SAVE_VERSION, caseId: data.id, savedAt: now.toISOString(), game, ui };
}

// ---------------------------------------------------------------------------
// Reading and validation

class Unreadable extends Error {}
const fail = (reason: string): never => {
  throw new Unreadable(reason);
};

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isWholeNumber = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;

function idList(value: unknown, field: string, known: Set<string>): string[] {
  if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) fail(`${field} is not a list of ids`);
  const list = value as string[];
  if (new Set(list).size !== list.length) fail(`${field} has duplicates`);
  for (const id of list) if (!known.has(id)) fail(`${field} has unknown id "${id}"`);
  return list;
}

const RATINGS: RatingId[] = ['master', 'chief', 'dogged'];

function parseOutcome(value: unknown): SavedGame['outcome'] {
  if (value === null) return null;
  if (!isObject(value) || value.kind !== 'proven' || !RATINGS.includes(value.rating as RatingId)) fail('outcome is invalid');
  const stats = (value as Record<string, unknown>).stats;
  const keys = ['contradictionsFound', 'contradictionsTotal', 'secretsUncovered', 'secretsTotal'] as const;
  if (!isObject(stats) || !keys.every((k) => isWholeNumber(stats[k]))) fail('outcome stats are invalid');
  const s = stats as Record<(typeof keys)[number], number>;
  return {
    kind: 'proven',
    rating: (value as { rating: RatingId }).rating,
    stats: {
      contradictionsFound: s.contradictionsFound,
      contradictionsTotal: s.contradictionsTotal,
      secretsUncovered: s.secretsUncovered,
      secretsTotal: s.secretsTotal,
    },
  };
}

function parseGame(data: CaseData, value: unknown): SavedGame {
  if (!isObject(value)) fail('game is missing');
  const g = value as Record<string, unknown>;
  if (g.caseId !== data.id) fail('game belongs to another case');

  const evidence = new Set(Object.keys(data.evidence));
  const hotspots = new Set(data.locations.flatMap((l) => l.hotspots.map((h) => h.id)));
  const suspects = new Set(data.suspects.map((s) => s.id));
  const topics = new Set(data.suspects.flatMap((s) => s.topics.map((t) => topicKey(s.id, t.id))));
  const contradictions = new Set(
    data.suspects.flatMap((s) => s.statements.flatMap((st) => (st.contradiction ? [st.contradiction.id] : []))),
  );

  if (!isWholeNumber(g.credibility) || g.credibility > data.startingCredibility) fail('credibility is out of range');
  if (!isWholeNumber(g.wrongPresentations)) fail('wrongPresentations is invalid');
  if (!isWholeNumber(g.failedAccusations)) fail('failedAccusations is invalid');

  return {
    caseId: data.id,
    evidence: idList(g.evidence, 'evidence', evidence),
    examined: idList(g.examined, 'examined', hotspots),
    interviewed: idList(g.interviewed, 'interviewed', suspects),
    topicsHeard: idList(g.topicsHeard, 'topicsHeard', topics),
    contradictions: idList(g.contradictions, 'contradictions', contradictions),
    credibility: g.credibility as number,
    wrongPresentations: g.wrongPresentations as number,
    failedAccusations: g.failedAccusations as number,
    outcome: parseOutcome(g.outcome),
  };
}

/** UI details are checked leniently: bad entries are dropped, not fatal. */
function parseUi(data: CaseData, value: unknown): SaveUi {
  const ui = isObject(value) ? value : {};
  const hintTiers: Record<string, number> = {};
  if (isObject(ui.hintTiers)) {
    for (const hint of data.hints) {
      const tier = ui.hintTiers[hint.id];
      if (isWholeNumber(tier) && tier >= 1) hintTiers[hint.id] = Math.min(tier, hint.tiers.length);
    }
  }
  return { hintTiers, galeOpened: ui.galeOpened === true, view: parseView(ui.view) };
}

function parseView(value: unknown): ResumeView {
  if (!isObject(value)) return { name: 'rooms' };
  const { name, id } = value;
  if (name === 'rooms' || name === 'suspects' || name === 'casefile' || name === 'accuse') return { name };
  if ((name === 'location' || name === 'interview') && typeof id === 'string') return { name, id };
  return { name: 'rooms' };
}

/** Parses raw stored text. Never throws. */
export function parseSave(data: CaseData, raw: string | null): ReadResult {
  if (raw === null || raw.trim() === '') return { status: 'none' };
  try {
    let file: unknown;
    try {
      file = JSON.parse(raw);
    } catch {
      fail('not valid JSON');
    }
    if (!isObject(file) || file.format !== SAVE_FORMAT) fail('not a Case Files save');
    let doc = file as Record<string, unknown>;
    if (!isWholeNumber(doc.version)) fail('missing version');
    if ((doc.version as number) > SAVE_VERSION) fail(`saved by a newer version (${doc.version})`);
    while ((doc.version as number) < SAVE_VERSION) {
      const migrate = MIGRATIONS[doc.version as number];
      if (!migrate) fail(`no upgrade from version ${doc.version}`);
      doc = migrate(doc);
    }
    if (doc.caseId !== data.id) fail('save belongs to another case');
    if (typeof doc.savedAt !== 'string' || Number.isNaN(Date.parse(doc.savedAt))) fail('savedAt is invalid');

    const game = parseGame(data, doc.game);
    const ui = parseUi(data, doc.ui);
    return { status: 'valid', save: { state: { ...game, lastEvent: { kind: 'none' } }, ui, savedAt: doc.savedAt as string } };
  } catch (err) {
    if (err instanceof Unreadable) return { status: 'unreadable', reason: err.message };
    return { status: 'unreadable', reason: 'unexpected error' };
  }
}

// ---------------------------------------------------------------------------
// Storage access: every call guarded

/** The browser's localStorage, or null where it is unavailable or blocked. */
export function getStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readSave(data: CaseData, storage: Storage | null): ReadResult {
  if (!storage) return { status: 'none' };
  try {
    return parseSave(data, storage.getItem(saveKey(data.id)));
  } catch {
    return { status: 'none' };
  }
}

export function writeSave(data: CaseData, storage: Storage | null, file: SaveFile): boolean {
  if (!storage) return false;
  try {
    storage.setItem(saveKey(data.id), JSON.stringify(file));
    return true;
  } catch {
    return false;
  }
}

export function clearSave(data: CaseData, storage: Storage | null): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(saveKey(data.id));
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Session controller: the one place that decides when saving is allowed.

export interface SaveInfo {
  status: 'none' | 'valid' | 'unreadable';
  savedAt?: string;
  solved: boolean;
}

export type AutosaveResult = 'skipped' | 'written' | 'failed';

export interface SaveController {
  /** What is stored right now (as far as this session knows). */
  info(): SaveInfo;
  /** Whether a game session is active (autosave enabled). */
  isActive(): boolean;
  /** Continue: returns the stored save to load, or null to keep the in-memory game. */
  continueGame(): LoadedSave | null;
  /** New Game / Play Again: clears the stored save and enables autosave. */
  startNewGame(): void;
  /** Saves progress if a session is active and there is progress to save. */
  autosave(state: GameState, ui: SaveUi, now?: Date): AutosaveResult;
}

export function createSaveController(data: CaseData, storage: Storage | null): SaveController {
  // Read and validate once, before anything can be written.
  const initial = readSave(data, storage);
  let info: SaveInfo =
    initial.status === 'valid'
      ? { status: 'valid', savedAt: initial.save.savedAt, solved: initial.save.state.outcome !== null }
      : { status: initial.status, solved: false };
  let active = false;

  return {
    info: () => info,
    isActive: () => active,

    continueGame() {
      // Same session: the in-memory game is current (autosave keeps storage in step).
      if (active) return null;
      // Fresh page load: read again in case another tab saved since start-up.
      const result = readSave(data, storage);
      if (result.status !== 'valid') {
        info = { status: result.status, solved: false };
        return null;
      }
      active = true;
      info = { status: 'valid', savedAt: result.save.savedAt, solved: result.save.state.outcome !== null };
      return result.save;
    },

    startNewGame() {
      clearSave(data, storage);
      info = { status: 'none', solved: false };
      active = true;
    },

    autosave(state, ui, now = new Date()) {
      if (!active || !hasProgress(state)) return 'skipped';
      const file = serializeSave(data, state, ui, now);
      if (!writeSave(data, storage, file)) return 'failed';
      info = { status: 'valid', savedAt: file.savedAt, solved: state.outcome !== null };
      return 'written';
    },
  };
}

// ---------------------------------------------------------------------------

/** "Saved today at 14:32" / "Saved on 12 Oct at 09:10". */
export function formatSavedAt(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return `Saved today at ${time}`;
  const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `Saved on ${day} at ${time}`;
}
