import { describe, expect, it } from 'vitest';
import { ashgrove } from '../case/ashgrove';
import { SLOT_IDS } from '../engine';
import { SLOT_LABELS } from './feedback';
import { saveKey } from './save';
import {
  DEFAULT_TIPS,
  NOTES,
  TIPS_KEY,
  markSeen,
  pendingNotes,
  readTips,
  showAgain,
  skipAll,
  writeTips,
  type NoteId,
} from './tips';

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(k: string) {
    return this.map.has(k) ? this.map.get(k)! : null;
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null;
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
  setItem(k: string, v: string) {
    this.map.set(k, String(v));
  }
}
const broken = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('full');
  },
} as unknown as Storage;

describe('tip progress storage', () => {
  it('starts with every note unseen and tips on', () => {
    expect(readTips(new MemoryStorage())).toEqual(DEFAULT_TIPS);
    expect(readTips(null)).toEqual(DEFAULT_TIPS);
  });

  it('round-trips seen notes and the skip flag', () => {
    const storage = new MemoryStorage();
    const tips = skipAll(markSeen(markSeen(DEFAULT_TIPS, 'room-search'), 'accuse'));
    expect(writeTips(storage, tips)).toBe(true);
    expect(readTips(storage)).toEqual({ seen: ['room-search', 'accuse'], off: true });
  });

  it('corrupted, outdated or blocked storage simply shows the tips (never throws)', () => {
    const storage = new MemoryStorage();
    for (const raw of ['{oops', '[]', '{"v":99,"seen":[],"off":true}', '{"v":1,"seen":"x"}']) {
      storage.setItem(TIPS_KEY, raw);
      expect(readTips(storage)).toEqual(DEFAULT_TIPS);
    }
    expect(readTips(broken)).toEqual(DEFAULT_TIPS);
    expect(writeTips(broken, DEFAULT_TIPS)).toBe(false);
  });

  it('ignores unknown note ids', () => {
    const storage = new MemoryStorage();
    storage.setItem(TIPS_KEY, JSON.stringify({ v: 1, seen: ['room-search', 'nonsense'], off: false }));
    expect(readTips(storage).seen).toEqual(['room-search']);
  });

  it('is kept apart from the investigation save', () => {
    expect(TIPS_KEY).not.toBe(saveKey(ashgrove.id));
    const storage = new MemoryStorage();
    storage.setItem(saveKey(ashgrove.id), 'SAVE');
    writeTips(storage, skipAll(DEFAULT_TIPS));
    expect(storage.getItem(saveKey(ashgrove.id))).toBe('SAVE');
  });
});

describe('Got it, Skip tips, Show tips again', () => {
  it('"Got it" marks one note seen, once', () => {
    const t = markSeen(markSeen(DEFAULT_TIPS, 'casefile'), 'casefile');
    expect(t.seen).toEqual(['casefile']);
    expect(pendingNotes(t, ['casefile', 'accuse'])).toEqual(['accuse']);
  });

  it('"Skip tips" hides every future note but remembers what was seen', () => {
    const t = skipAll(markSeen(DEFAULT_TIPS, 'room-search'));
    expect(pendingNotes(t, ['room-search', 'room-gale', 'accuse'])).toEqual([]);
    expect(t.seen).toEqual(['room-search']);
  });

  it('"Show tips again" re-enables every note', () => {
    const t = showAgain();
    expect(t).toEqual(DEFAULT_TIPS);
    expect(pendingNotes(t, ['interview-ask', 'interview-challenge'])).toEqual(['interview-ask', 'interview-challenge']);
  });

  it('keeps each screen’s notes in order', () => {
    const t = markSeen(DEFAULT_TIPS, 'interview-ask');
    expect(pendingNotes(t, ['interview-ask', 'interview-challenge'])).toEqual(['interview-challenge']);
  });
});

describe('note content', () => {
  const all = Object.values(NOTES)
    .map((n) => `${n.title} ${n.text}`)
    .join(' ');

  it('there is one note for each area', () => {
    expect(Object.keys(NOTES).sort()).toEqual(
      (['accuse', 'casefile', 'interview-ask', 'interview-challenge', 'room-gale', 'room-search'] as NoteId[]).sort(),
    );
  });

  it('separates Ask about from Challenge, and says most cards are not contradictions', () => {
    expect(NOTES['interview-ask'].text).toMatch(/free/);
    expect(NOTES['interview-challenge'].text).toMatch(/only when it proves a statement false/);
    expect(NOTES['interview-challenge'].text).toMatch(/most cards are not contradictions/);
  });

  it('the Accuse note names the four parts and says each card must prove its own part', () => {
    for (const slot of SLOT_IDS) expect(NOTES.accuse.text).toContain(SLOT_LABELS[slot].title);
    expect(NOTES.accuse.text).toMatch(/must prove its own part, not just look suspicious/);
    expect(NOTES.accuse.text).toMatch(/always try again/);
  });

  it('reveals no suspect, card or clue', () => {
    const forbidden = [
      ...ashgrove.suspects.map((s) => s.name),
      ...Object.values(ashgrove.evidence).map((e) => e.name),
      'Theo', 'Lyle', 'Julian', 'Clara', 'Victoria', 'Pell', 'bank', 'cufflink', 'fern', 'hamper', 'tincture',
    ];
    for (const term of forbidden) expect(all, term).not.toContain(term);
    expect(all).not.toMatch(/\bE\d{1,2}\b|\bT-[A-F]\b/);
  });
});
