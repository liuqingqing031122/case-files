import { afterEach, describe, expect, it } from 'vitest';
import { ashgrove } from '../case/ashgrove';
import { initialState, reduce, type GameAction, type GameState } from '../engine';
import {
  MIGRATIONS,
  SAVE_FORMAT,
  SAVE_VERSION,
  clearSave,
  createSaveController,
  formatSavedAt,
  getStorage,
  hasProgress,
  parseSave,
  readSave,
  resumeView,
  saveKey,
  serializeSave,
  writeSave,
  type SaveUi,
} from './save';

// --- helpers ---------------------------------------------------------------

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  setItem(key: string, value: string) {
    this.map.set(key, String(value));
  }
}

/** Storage that throws on every call, like a blocked or full localStorage. */
const brokenStorage = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
  removeItem: () => {
    throw new Error('SecurityError');
  },
} as unknown as Storage;

const KEY = saveKey(ashgrove.id);
const play = (actions: GameAction[], from: GameState = initialState(ashgrove)) =>
  actions.reduce((s, a) => reduce(ashgrove, s, a), from);

// The bible's critical path (opportunity via Julian), stopping before the accusation.
const criticalPath: GameAction[] = [
  { type: 'examine', locationId: 'study', hotspotId: 'forcedDrawer' },
  { type: 'examine', locationId: 'study', hotspotId: 'draftWill' },
  { type: 'examine', locationId: 'study', hotspotId: 'blotter' },
  { type: 'examine', locationId: 'study', hotspotId: 'deskFloor' },
  { type: 'askTopic', suspectId: 'pell', topicId: 'tonic' },
  { type: 'examine', locationId: 'servants', hotspotId: 'householdBook' },
  { type: 'examine', locationId: 'servants', hotspotId: 'laundryHamper' },
  { type: 'press', suspectId: 'julian', statementId: 'study', evidenceId: 'E1' }, // a wrong press, for credibility
  { type: 'press', suspectId: 'julian', statementId: 'study', evidenceId: 'E10' },
];
const midGame = play(criticalPath);
const ui: SaveUi = { hintTiers: { draftWill: 2, laundry: 3 }, galeOpened: true, view: { name: 'interview', id: 'julian' } };
const proof: GameAction = {
  type: 'accuse',
  accusation: { suspectId: 'theo', slots: { motive: 'E12', means: 'E14', opportunity: 'T-C', physical: 'E17' } },
};

const validFile = () => JSON.parse(JSON.stringify(serializeSave(ashgrove, midGame, ui))) as Record<string, any>;
const raw = (edit: (file: Record<string, any>) => void = () => {}) => {
  const file = validFile();
  edit(file);
  return JSON.stringify(file);
};

// --- format ----------------------------------------------------------------

describe('save format', () => {
  it('is versioned and tagged, and does not store transient feedback', () => {
    const file = serializeSave(ashgrove, midGame, ui, new Date('2026-10-23T14:32:05Z'));
    expect(file).toMatchObject({ format: SAVE_FORMAT, version: SAVE_VERSION, caseId: 'ashgrove', savedAt: '2026-10-23T14:32:05.000Z' });
    expect(file.game).not.toHaveProperty('lastEvent');
    expect(JSON.stringify(file).length).toBeLessThan(5000);
  });

  it('round-trips progress, credibility, hints and the resume screen exactly', () => {
    const result = parseSave(ashgrove, raw());
    expect(result.status).toBe('valid');
    if (result.status !== 'valid') return;
    expect(result.save.state).toEqual({ ...midGame, lastEvent: { kind: 'none' } });
    expect(result.save.state.credibility).toBe(4);
    expect(result.save.state.wrongPresentations).toBe(1);
    expect(result.save.ui).toEqual(ui);
  });

  it('a loaded game can be finished: the case is still provable', () => {
    const result = parseSave(ashgrove, raw());
    if (result.status !== 'valid') throw new Error('expected valid');
    expect(reduce(ashgrove, result.save.state, proof).outcome?.kind).toBe('proven');
  });

  it('a solved case round-trips its outcome', () => {
    const solved = reduce(ashgrove, midGame, proof);
    const result = parseSave(ashgrove, JSON.stringify(serializeSave(ashgrove, solved, ui)));
    if (result.status !== 'valid') throw new Error('expected valid');
    expect(result.save.state.outcome).toEqual(solved.outcome);
  });
});

// --- unreadable saves -------------------------------------------------------

describe('missing, corrupted and incompatible saves', () => {
  it('treats nothing stored as "none"', () => {
    for (const value of [null, '', '   ']) expect(parseSave(ashgrove, value)).toEqual({ status: 'none' });
  });

  const unreadable: [string, string][] = [
    ['not JSON', '{oops'],
    ['a JSON array', '[]'],
    ['a JSON number', '42'],
    ['another format', raw((f) => (f.format = 'something-else'))],
    ['a missing version', raw((f) => delete f.version)],
    ['a newer version', raw((f) => (f.version = SAVE_VERSION + 1))],
    ['an older version with no upgrade', raw((f) => (f.version = 0))],
    ['another case', raw((f) => (f.caseId = 'other-case'))],
    ['a bad savedAt', raw((f) => (f.savedAt = 'yesterday'))],
    ['a missing game', raw((f) => delete f.game)],
    ['a game for another case', raw((f) => (f.game.caseId = 'other-case'))],
    ['credibility above the maximum', raw((f) => (f.game.credibility = 6))],
    ['negative credibility', raw((f) => (f.game.credibility = -1))],
    ['fractional credibility', raw((f) => (f.game.credibility = 2.5))],
    ['credibility as text', raw((f) => (f.game.credibility = '3'))],
    ['bad counters', raw((f) => (f.game.failedAccusations = -2))],
    ['evidence not a list', raw((f) => (f.game.evidence = 'E1'))],
    ['evidence with non-strings', raw((f) => (f.game.evidence = ['E1', 7]))],
    ['duplicate evidence', raw((f) => f.game.evidence.push('E1'))],
    ['unknown evidence', raw((f) => f.game.evidence.push('E99'))],
    ['unknown hotspot', raw((f) => f.game.examined.push('secretPassage'))],
    ['unknown suspect', raw((f) => f.game.interviewed.push('butler'))],
    ['unknown topic', raw((f) => f.game.topicsHeard.push('pell:weather'))],
    ['unknown contradiction', raw((f) => f.game.contradictions.push('C9'))],
    ['a malformed outcome', raw((f) => (f.game.outcome = { kind: 'proven', rating: 'genius', stats: {} }))],
    ['outcome with bad stats', raw((f) => (f.game.outcome = { kind: 'proven', rating: 'master', stats: { contradictionsFound: -1 } }))],
  ];

  for (const [label, value] of unreadable) {
    it(`rejects ${label}`, () => {
      expect(parseSave(ashgrove, value).status).toBe('unreadable');
    });
  }

  it('never throws, even on hostile input', () => {
    for (const value of ['null', 'true', '{"format":"case-files-save","version":1,"caseId":"ashgrove","savedAt":"2026-01-01","game":null}']) {
      expect(() => parseSave(ashgrove, value)).not.toThrow();
      expect(parseSave(ashgrove, value).status).toBe('unreadable');
    }
  });
});

describe('migrations', () => {
  afterEach(() => {
    delete MIGRATIONS[0];
  });

  it('upgrades an older version when a migration exists', () => {
    // Pretend version 0 stored credibility under a different name.
    const old = validFile();
    old.version = 0;
    old.game.trust = old.game.credibility;
    delete old.game.credibility;
    MIGRATIONS[0] = (doc) => {
      const game = { ...(doc.game as Record<string, unknown>) };
      game.credibility = game.trust;
      delete game.trust;
      return { ...doc, version: 1, game };
    };
    const result = parseSave(ashgrove, JSON.stringify(old));
    expect(result.status).toBe('valid');
    if (result.status === 'valid') expect(result.save.state.credibility).toBe(4);
  });
});

describe('lenient UI details', () => {
  it('drops bad hint entries and clamps tiers instead of rejecting the save', () => {
    const result = parseSave(ashgrove, raw((f) => (f.ui.hintTiers = { draftWill: 99, bogus: 2, laundry: 'x', bankLetter: 0 })));
    if (result.status !== 'valid') throw new Error('expected valid');
    expect(result.save.ui.hintTiers).toEqual({ draftWill: 3 });
  });

  it('defaults invalid flags and screens', () => {
    const cases: [string, boolean][] = [
      [raw((f) => (f.ui = { galeOpened: 'yes', view: { name: 'title' } })), false],
      [raw((f) => (f.ui.view = { name: 'location' })), true], // only the screen is broken
      [raw((f) => delete f.ui), false],
    ];
    for (const [value, galeOpened] of cases) {
      const result = parseSave(ashgrove, value);
      if (result.status !== 'valid') throw new Error('expected valid');
      expect(result.save.ui.view).toEqual({ name: 'rooms' });
      expect(result.save.ui.galeOpened).toBe(galeOpened);
    }
  });
});

// --- resume screen and progress -------------------------------------------

describe('resumeView', () => {
  const fresh = initialState(ashgrove);

  it('returns to the saved investigation screen when it is still valid', () => {
    expect(resumeView(ashgrove, fresh, { name: 'casefile' })).toEqual({ name: 'casefile' });
    expect(resumeView(ashgrove, fresh, { name: 'interview', id: 'theo' })).toEqual({ name: 'interview', id: 'theo' });
    expect(resumeView(ashgrove, midGame, { name: 'location', id: 'servants' })).toEqual({ name: 'location', id: 'servants' });
  });

  it('falls back to Rooms for locked rooms and unknown places or people', () => {
    expect(resumeView(ashgrove, fresh, { name: 'location', id: 'servants' })).toEqual({ name: 'rooms' });
    expect(resumeView(ashgrove, fresh, { name: 'location', id: 'attic' })).toEqual({ name: 'rooms' });
    expect(resumeView(ashgrove, fresh, { name: 'interview', id: 'butler' })).toEqual({ name: 'rooms' });
  });

  it('a solved case always resumes at the ending', () => {
    expect(resumeView(ashgrove, reduce(ashgrove, midGame, proof), { name: 'rooms' })).toEqual({ name: 'ending' });
  });
});

describe('hasProgress', () => {
  it('is false for a fresh game and true after any kind of action', () => {
    expect(hasProgress(initialState(ashgrove))).toBe(false);
    const actions: GameAction[] = [
      { type: 'examine', locationId: 'dining', hotspotId: 'window' },
      { type: 'askTopic', suspectId: 'clara', topicId: 'father' },
      { type: 'press', suspectId: 'clara', statementId: 'alibi', evidenceId: 'E1' },
      { type: 'accuse', accusation: { suspectId: 'pell', slots: {} } },
    ];
    for (const action of actions) expect(hasProgress(play([action])), action.type).toBe(true);
  });
});

// --- storage access --------------------------------------------------------

describe('storage access', () => {
  it('works with a normal storage', () => {
    const storage = new MemoryStorage();
    expect(writeSave(ashgrove, storage, serializeSave(ashgrove, midGame, ui))).toBe(true);
    expect(readSave(ashgrove, storage).status).toBe('valid');
    expect(clearSave(ashgrove, storage)).toBe(true);
    expect(readSave(ashgrove, storage)).toEqual({ status: 'none' });
  });

  it('never throws when storage is missing or blocked', () => {
    expect(readSave(ashgrove, null)).toEqual({ status: 'none' });
    expect(writeSave(ashgrove, null, serializeSave(ashgrove, midGame, ui))).toBe(false);
    expect(() => readSave(ashgrove, brokenStorage)).not.toThrow();
    expect(readSave(ashgrove, brokenStorage)).toEqual({ status: 'none' });
    expect(writeSave(ashgrove, brokenStorage, serializeSave(ashgrove, midGame, ui))).toBe(false);
    expect(clearSave(ashgrove, brokenStorage)).toBe(false);
  });

  it('has no localStorage outside a browser', () => {
    expect(getStorage()).toBeNull();
  });
});

// --- session controller: initialization safety and flows ------------------

describe('save controller: start-up safety', () => {
  const stored = () => {
    const storage = new MemoryStorage();
    storage.setItem(KEY, JSON.stringify(serializeSave(ashgrove, midGame, ui, new Date('2026-10-20T09:00:00Z'))));
    return storage;
  };

  it('reads and validates the save before anything else', () => {
    const controller = createSaveController(ashgrove, stored());
    expect(controller.info()).toEqual({ status: 'valid', savedAt: '2026-10-20T09:00:00.000Z', solved: false });
    expect(controller.isActive()).toBe(false);
  });

  it('never overwrites an existing save with the blank start-up state', () => {
    const storage = stored();
    const before = storage.getItem(KEY);
    const controller = createSaveController(ashgrove, storage);
    expect(controller.autosave(initialState(ashgrove), { hintTiers: {}, galeOpened: false, view: { name: 'rooms' } })).toBe('skipped');
    expect(storage.getItem(KEY)).toBe(before);
  });

  it('does not save at all until the player chooses Continue or New Game, even with progress', () => {
    const storage = stored();
    const before = storage.getItem(KEY);
    const controller = createSaveController(ashgrove, storage);
    expect(controller.autosave(play([{ type: 'examine', locationId: 'dining', hotspotId: 'window' }]), ui)).toBe('skipped');
    expect(storage.getItem(KEY)).toBe(before);
  });
});

describe('save controller: Continue', () => {
  it('after a refresh: loads the stored game and then keeps saving it', () => {
    const storage = new MemoryStorage();
    storage.setItem(KEY, JSON.stringify(serializeSave(ashgrove, midGame, ui)));
    const controller = createSaveController(ashgrove, storage);

    const loaded = controller.continueGame();
    expect(loaded?.state).toEqual({ ...midGame, lastEvent: { kind: 'none' } });
    expect(loaded?.ui).toEqual(ui);
    expect(controller.isActive()).toBe(true);

    const next = reduce(ashgrove, loaded!.state, proof);
    expect(controller.autosave(next, ui)).toBe('written');
    expect(controller.info().solved).toBe(true);
  });

  it('in the same session: keeps the in-memory game instead of reloading', () => {
    const controller = createSaveController(ashgrove, new MemoryStorage());
    controller.startNewGame();
    controller.autosave(midGame, ui);
    expect(controller.continueGame()).toBeNull();
    expect(controller.isActive()).toBe(true);
  });

  it('a whole session, then a refresh, restores exactly what was played', () => {
    const storage = new MemoryStorage();
    const session1 = createSaveController(ashgrove, storage);
    session1.startNewGame();
    let state = initialState(ashgrove);
    for (const action of criticalPath) {
      state = reduce(ashgrove, state, action);
      session1.autosave(state, ui);
    }

    const session2 = createSaveController(ashgrove, storage); // the refresh
    expect(session2.info().status).toBe('valid');
    expect(session2.continueGame()?.state).toEqual({ ...state, lastEvent: { kind: 'none' } });
  });

  it('if the save disappears after start-up, Continue offers nothing and stays inactive', () => {
    const storage = new MemoryStorage();
    storage.setItem(KEY, JSON.stringify(serializeSave(ashgrove, midGame, ui)));
    const controller = createSaveController(ashgrove, storage);
    storage.removeItem(KEY);
    expect(controller.continueGame()).toBeNull();
    expect(controller.isActive()).toBe(false);
    expect(controller.info().status).toBe('none');
  });

  it('a solved save is reported as solved', () => {
    const storage = new MemoryStorage();
    storage.setItem(KEY, JSON.stringify(serializeSave(ashgrove, reduce(ashgrove, midGame, proof), ui)));
    expect(createSaveController(ashgrove, storage).info().solved).toBe(true);
  });
});

describe('save controller: New Game / Play Again', () => {
  it('clears the old save; nothing is written until there is new progress', () => {
    const storage = new MemoryStorage();
    storage.setItem(KEY, JSON.stringify(serializeSave(ashgrove, midGame, ui)));
    const controller = createSaveController(ashgrove, storage);

    controller.startNewGame();
    expect(storage.getItem(KEY)).toBeNull();
    expect(controller.info()).toEqual({ status: 'none', solved: false });
    expect(controller.autosave(initialState(ashgrove), { hintTiers: {}, galeOpened: false, view: { name: 'rooms' } })).toBe('skipped');
    expect(storage.getItem(KEY)).toBeNull();

    const progressed = play([{ type: 'examine', locationId: 'dining', hotspotId: 'fernPlanter' }]);
    expect(controller.autosave(progressed, ui)).toBe('written');
    expect(readSave(ashgrove, storage).status).toBe('valid');
  });

  it('replaces an unreadable save', () => {
    const storage = new MemoryStorage();
    storage.setItem(KEY, '{broken');
    const controller = createSaveController(ashgrove, storage);
    expect(controller.info().status).toBe('unreadable');
    expect(controller.continueGame()).toBeNull();

    controller.startNewGame();
    controller.autosave(midGame, ui);
    expect(readSave(ashgrove, storage).status).toBe('valid');
  });
});

describe('save controller: storage unavailable', () => {
  it('the game carries on and reports that saving failed', () => {
    for (const storage of [null, brokenStorage]) {
      const controller = createSaveController(ashgrove, storage);
      expect(controller.info().status).toBe('none');
      controller.startNewGame();
      expect(controller.autosave(midGame, ui)).toBe('failed');
      expect(controller.isActive()).toBe(true);
    }
  });
});

describe('formatSavedAt', () => {
  it('says "today" for saves from today, otherwise the date', () => {
    const now = new Date(2026, 9, 23, 18, 0);
    expect(formatSavedAt(new Date(2026, 9, 23, 14, 32).toISOString(), now)).toBe('Saved today at 14:32');
    expect(formatSavedAt(new Date(2026, 9, 12, 9, 5).toISOString(), now)).toBe('Saved on 12 Oct at 09:05');
  });
});
