import { describe, expect, it } from 'vitest';
import { miniCase } from './__fixtures__/miniCase';
import { initialState, reduce } from './state';
import { play } from './testUtils';

describe('initialState', () => {
  it('starts with the starting evidence and full credibility', () => {
    const s = initialState(miniCase);
    expect(s.evidence).toEqual(['note']);
    expect(s.credibility).toBe(5);
    expect(s.outcome).toBeNull();
  });

  it('is plain JSON so it can be saved', () => {
    const s = play([
      { type: 'examine', locationId: 'hall', hotspotId: 'coatStand' },
      { type: 'askTopic', suspectId: 'maid', topicId: 'evening' },
    ]);
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  });
});

describe('examine', () => {
  it('adds evidence and records the hotspot', () => {
    const s = play([{ type: 'examine', locationId: 'hall', hotspotId: 'coatStand' }]);
    expect(s.evidence).toEqual(['note', 'glove']);
    expect(s.examined).toEqual(['coatStand']);
    expect(s.lastEvent).toEqual({ kind: 'examined', hotspotId: 'coatStand', gained: ['glove'], note: undefined });
  });

  it('does not duplicate evidence when examined twice', () => {
    const s = play([
      { type: 'examine', locationId: 'hall', hotspotId: 'coatStand' },
      { type: 'examine', locationId: 'hall', hotspotId: 'coatStand' },
    ]);
    expect(s.evidence).toEqual(['note', 'glove']);
    expect(s.lastEvent).toMatchObject({ kind: 'examined', gained: [] });
  });

  it('reports notes for observation-only hotspots', () => {
    const s = play([{ type: 'examine', locationId: 'hall', hotspotId: 'clock' }]);
    expect(s.lastEvent).toMatchObject({ kind: 'examined', gained: [], note: 'It is ten minutes slow.' });
  });

  it('rejects locked hotspots and locked locations without changing progress', () => {
    const start = initialState(miniCase);
    const lockedHotspot = reduce(miniCase, start, { type: 'examine', locationId: 'hall', hotspotId: 'desk' });
    expect(lockedHotspot.lastEvent.kind).toBe('rejected');
    expect(lockedHotspot.evidence).toEqual(start.evidence);

    const lockedRoom = reduce(miniCase, start, { type: 'examine', locationId: 'pantry', hotspotId: 'shelf' });
    expect(lockedRoom.lastEvent.kind).toBe('rejected');
    expect(lockedRoom.examined).toEqual([]);
  });

  it('unlocks gated hotspots once the condition is met', () => {
    const s = play([
      { type: 'examine', locationId: 'hall', hotspotId: 'coatStand' },
      { type: 'examine', locationId: 'hall', hotspotId: 'desk' },
    ]);
    expect(s.evidence).toContain('ledger');
  });

  it('opens a location through either branch of anyOf', () => {
    const viaLedger = play([
      { type: 'examine', locationId: 'hall', hotspotId: 'coatStand' },
      { type: 'examine', locationId: 'hall', hotspotId: 'desk' },
      { type: 'examine', locationId: 'cellar', hotspotId: 'barrel' },
    ]);
    expect(viaLedger.lastEvent.kind).toBe('examined');

    const viaContradiction = play([
      { type: 'askTopic', suspectId: 'maid', topicId: 'evening' },
      { type: 'examine', locationId: 'pantry', hotspotId: 'backDoor' },
      { type: 'askTopic', suspectId: 'butler', topicId: 'brooch' },
      { type: 'press', suspectId: 'butler', statementId: 'alibi', evidenceId: 'mud' },
      { type: 'examine', locationId: 'cellar', hotspotId: 'barrel' },
    ]);
    expect(viaContradiction.lastEvent.kind).toBe('examined');
  });
});

describe('interviews and topics', () => {
  it('asking an available topic counts as interviewing, and unlocks dependent locations', () => {
    const s = play([
      { type: 'askTopic', suspectId: 'maid', topicId: 'evening' },
      { type: 'examine', locationId: 'pantry', hotspotId: 'shelf' },
    ]);
    expect(s.interviewed).toEqual(['maid']);
    expect(s.evidence).toContain('receipt');
  });

  it('pressing a statement counts as interviewing, even with the wrong card', () => {
    const s = play([{ type: 'press', suspectId: 'maid', statementId: 'alibi', evidenceId: 'note' }]);
    expect(s.lastEvent.kind).toBe('wrongPress');
    expect(s.interviewed).toEqual(['maid']);
    expect(play([{ type: 'examine', locationId: 'pantry', hotspotId: 'shelf' }], miniCase, s).evidence).toContain('receipt');
  });

  it('a locked topic or an unheld card does not count as interviewing', () => {
    const locked = play([{ type: 'askTopic', suspectId: 'cook', topicId: 'shopping' }]);
    expect(locked.lastEvent.kind).toBe('rejected');
    expect(locked.interviewed).toEqual([]);

    const unheld = play([{ type: 'press', suspectId: 'maid', statementId: 'alibi', evidenceId: 'receipt' }]);
    expect(unheld.lastEvent.kind).toBe('rejected');
    expect(unheld.interviewed).toEqual([]);
  });

  it('interviewing a suspect twice does not duplicate them', () => {
    const s = play([
      { type: 'askTopic', suspectId: 'maid', topicId: 'evening' },
      { type: 'askTopic', suspectId: 'maid', topicId: 'evening' },
    ]);
    expect(s.interviewed).toEqual(['maid']);
    expect(s.topicsHeard).toEqual(['maid:evening']);
  });

  it('gated topics give testimony once unlocked, and can be re-asked', () => {
    const steps = [
      { type: 'askTopic', suspectId: 'maid', topicId: 'evening' },
      { type: 'examine', locationId: 'pantry', hotspotId: 'shelf' },
      { type: 'askTopic', suspectId: 'cook', topicId: 'shopping' },
    ] as const;
    const s = play([...steps]);
    expect(s.evidence).toContain('tCook');
    expect(s.topicsHeard).toEqual(['maid:evening', 'cook:shopping']);

    const again = play([{ type: 'askTopic', suspectId: 'cook', topicId: 'shopping' }], miniCase, s);
    expect(again.lastEvent).toMatchObject({ kind: 'topic', gained: [] });
    expect(again.topicsHeard).toEqual(['maid:evening', 'cook:shopping']);
  });
});

describe('pressing statements', () => {
  const ready = play([
    { type: 'askTopic', suspectId: 'maid', topicId: 'evening' },
    { type: 'examine', locationId: 'pantry', hotspotId: 'shelf' },
  ]);

  it('breaks a contradiction with an accepted card and grants testimony', () => {
    const s = reduce(miniCase, ready, { type: 'press', suspectId: 'maid', statementId: 'alibi', evidenceId: 'receipt' });
    expect(s.contradictions).toEqual(['cMaid']);
    expect(s.evidence).toContain('tMaid');
    expect(s.credibility).toBe(5);
    expect(s.lastEvent).toMatchObject({ kind: 'contradiction', contradictionId: 'cMaid', gained: ['tMaid'] });
  });

  it('accepts any of several cards for the same contradiction', () => {
    for (const card of ['mud', 'tMaid']) {
      const s = play([
        { type: 'askTopic', suspectId: 'maid', topicId: 'evening' },
        { type: 'examine', locationId: 'pantry', hotspotId: 'shelf' },
        { type: 'examine', locationId: 'pantry', hotspotId: 'backDoor' },
        { type: 'press', suspectId: 'maid', statementId: 'alibi', evidenceId: 'receipt' },
        { type: 'askTopic', suspectId: 'butler', topicId: 'brooch' },
        { type: 'press', suspectId: 'butler', statementId: 'alibi', evidenceId: card },
      ]);
      expect(s.contradictions).toContain('cButler');
    }
  });

  it('costs one credibility for a wrong card, using the statement’s reply', () => {
    const s = reduce(miniCase, ready, { type: 'press', suspectId: 'maid', statementId: 'alibi', evidenceId: 'note' });
    expect(s.credibility).toBe(4);
    expect(s.wrongPresentations).toBe(1);
    expect(s.contradictions).toEqual([]);
    expect(s.lastEvent).toEqual({
      kind: 'wrongPress',
      suspectId: 'maid',
      response: 'That has nothing to do with me!',
      credibility: 4,
    });
  });

  it('falls back to the suspect’s default reply, and true statements cannot be broken', () => {
    const s = play([
      { type: 'askTopic', suspectId: 'cook', topicId: 'kitchen' },
      { type: 'press', suspectId: 'cook', statementId: 'alibi', evidenceId: 'note' },
    ]);
    expect(s.lastEvent).toMatchObject({ kind: 'wrongPress', response: 'Eh?' });
  });

  it('never drops credibility below zero and never locks pressing', () => {
    const wrong = { type: 'press', suspectId: 'maid', statementId: 'alibi', evidenceId: 'note' } as const;
    const s = play(Array(8).fill(wrong), miniCase, ready);
    expect(s.credibility).toBe(0);
    expect(s.wrongPresentations).toBe(8);
    const recovered = reduce(miniCase, s, { type: 'press', suspectId: 'maid', statementId: 'alibi', evidenceId: 'receipt' });
    expect(recovered.contradictions).toEqual(['cMaid']);
  });

  it('pressing a broken statement again is free', () => {
    const broken = reduce(miniCase, ready, { type: 'press', suspectId: 'maid', statementId: 'alibi', evidenceId: 'receipt' });
    const again = reduce(miniCase, broken, { type: 'press', suspectId: 'maid', statementId: 'alibi', evidenceId: 'note' });
    expect(again.lastEvent).toEqual({ kind: 'alreadyBroken', contradictionId: 'cMaid' });
    expect(again.credibility).toBe(5);
  });

  it('rejects cards the player does not hold, with no penalty', () => {
    const unheld = reduce(miniCase, ready, { type: 'press', suspectId: 'maid', statementId: 'alibi', evidenceId: 'mud' });
    expect(unheld.lastEvent.kind).toBe('rejected');
    expect(unheld.credibility).toBe(5);
  });
});

describe('purity', () => {
  it('never mutates the previous state', () => {
    const before = initialState(miniCase);
    const snapshot = JSON.stringify(before);
    reduce(miniCase, before, { type: 'examine', locationId: 'hall', hotspotId: 'coatStand' });
    reduce(miniCase, before, { type: 'askTopic', suspectId: 'maid', topicId: 'evening' });
    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it('reset returns to the initial state', () => {
    const s = play([
      { type: 'examine', locationId: 'hall', hotspotId: 'coatStand' },
      { type: 'reset' },
    ]);
    expect(s).toEqual(initialState(miniCase));
  });
});
