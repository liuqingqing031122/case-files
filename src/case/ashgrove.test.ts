// Ashgrove Manor: fidelity to docs/solution-bible.md (v2.1) and solvability.
import { describe, expect, it } from 'vitest';
import {
  SLOT_IDS,
  allContradictions,
  caseStats,
  exploreAll,
  initialState,
  isMet,
  isReadyToAccuse,
  nextHint,
  openLocations,
  reduce,
  validateCase,
  type Accusation,
  type GameAction,
  type GameState,
} from '../engine';
import { ashgrove } from './ashgrove';

const play = (actions: GameAction[], from: GameState = initialState(ashgrove)) =>
  actions.reduce((s, a) => {
    const next = reduce(ashgrove, s, a);
    // A scripted playthrough should never hit a locked door.
    expect(next.lastEvent, JSON.stringify(a)).not.toMatchObject({ kind: 'rejected' });
    return next;
  }, from);

const examine = (locationId: string, hotspotId: string): GameAction => ({ type: 'examine', locationId, hotspotId });
/** Interview a suspect the way a player would: ask their first always-available topic. */
const interview = (suspectId: string): GameAction => {
  const topic = ashgrove.suspects.find((s) => s.id === suspectId)!.topics.find((t) => !t.requires)!;
  return { type: 'askTopic', suspectId, topicId: topic.id };
};
const press = (suspectId: string, statementId: string, evidenceId: string): GameAction => ({
  type: 'press',
  suspectId,
  statementId,
  evidenceId,
});
const accuse = (suspectId: string, slots: Accusation['slots']): GameAction => ({
  type: 'accuse',
  accusation: { suspectId, slots },
});

const explored = exploreAll(ashgrove);

// Bible §6 critical path: Study (E7→E8→E12), Servants' Hall (E14, E17),
// then C2 for opportunity. No Upstairs, no gated topics, no pressing Theo.
// Pressing Julian is itself what counts as interviewing him.
const criticalPath: GameAction[] = [
  examine('study', 'forcedDrawer'),
  examine('study', 'draftWill'),
  examine('study', 'blotter'),
  examine('study', 'deskFloor'),
  interview('pell'),
  examine('servants', 'householdBook'),
  examine('servants', 'laundryHamper'),
  press('julian', 'study', 'E10'),
];
const proof = { motive: 'E12', means: 'E14', opportunity: 'T-C', physical: 'E17' };

describe('case data integrity', () => {
  it('passes structural validation', () => {
    expect(validateCase(ashgrove)).toEqual([]);
  });

  it('has exactly the bible’s cards: E1–E18 and T-A–T-F', () => {
    const items = Array.from({ length: 18 }, (_, i) => `E${i + 1}`);
    const testimony = ['T-A', 'T-B', 'T-C', 'T-D', 'T-E', 'T-F'];
    expect(Object.keys(ashgrove.evidence).sort()).toEqual([...items, ...testimony].sort());
    for (const id of testimony) expect(ashgrove.evidence[id].kind).toBe('testimony');
    for (const id of items) expect(ashgrove.evidence[id].kind).toBe('item');
  });

  it('starts with Gale’s summary, Harlow’s report and the floor plan', () => {
    expect(ashgrove.startingEvidence).toEqual(['E1', 'E2', 'E3']);
  });
});

describe('fidelity to the bible', () => {
  it('§5: contradictions C1–C8 belong to the right suspects, accept the right cards, and yield the right cards', () => {
    const table = Object.fromEntries(
      allContradictions(ashgrove).map(({ suspect, contradiction: c }) => [
        c.id,
        { suspect: suspect.id, accepts: [...c.accepts].sort(), gives: [...(c.gives ?? [])].sort() },
      ]),
    );
    expect(table).toEqual({
      C1: { suspect: 'pell', accepts: ['E13'], gives: ['T-A', 'T-B'] },
      C2: { suspect: 'julian', accepts: ['E10'], gives: ['T-C'] },
      C3: { suspect: 'victoria', accepts: ['E6'], gives: ['E18', 'T-D'] },
      C4: { suspect: 'clara', accepts: ['E15'], gives: ['T-E'] },
      C5: { suspect: 'theo', accepts: ['T-A', 'T-C'], gives: [] },
      C6: { suspect: 'theo', accepts: ['E14'], gives: [] },
      C7: { suspect: 'theo', accepts: ['E17'], gives: [] },
      C8: { suspect: 'theo', accepts: ['E12'], gives: [] },
    });
  });

  it('§8: Theo is the culprit and each slot accepts exactly the bible’s cards', () => {
    const { culpritId, slots, rebuttals } = ashgrove.accusation;
    expect(culpritId).toBe('theo');
    expect(Object.fromEntries(SLOT_IDS.map((s) => [s, [...slots[s].accepts].sort()]))).toEqual({
      motive: ['E12'],
      means: ['E14', 'T-B', 'T-F'],
      opportunity: ['T-A', 'T-C'],
      physical: ['E17'],
    });
    expect(Object.keys(rebuttals).sort()).toEqual(['clara', 'julian', 'pell', 'victoria']);
  });

  it('§6: Dining Room and Study open at the start; the others open on interviews', () => {
    const ids = (s: GameState) => openLocations(ashgrove, s).map((l) => l.id);
    const start = initialState(ashgrove);
    expect(ids(start)).toEqual(['dining', 'study']);
    expect(ids(play([interview('pell')]))).toEqual(['dining', 'study', 'servants']);
    expect(ids(play([interview('victoria'), interview('julian')]))).not.toContain('upstairs');
    expect(ids(play([interview('victoria'), interview('julian'), interview('clara')]))).toContain('upstairs');
  });

  it('§6: Mrs. Pell is interviewed by asking a topic or by pressing; neither is needed twice', () => {
    const viaTopic = play([interview('pell')]);
    expect(openLocations(ashgrove, viaTopic).map((l) => l.id)).toContain('servants');

    const viaPress = play([press('pell', 'indoors', 'E1')]);
    expect(viaPress.lastEvent.kind).toBe('wrongPress');
    expect(openLocations(ashgrove, viaPress).map((l) => l.id)).toContain('servants');
  });

  it('§6: Upstairs needs all three family interviews, by any mix of topics and presses', () => {
    const two = play([interview('victoria'), press('julian', 'dressing', 'E1')]);
    expect(openLocations(ashgrove, two).map((l) => l.id)).not.toContain('upstairs');
    const three = play([press('clara', 'alibi', 'E2')], two);
    expect(openLocations(ashgrove, three).map((l) => l.id)).toContain('upstairs');
  });

  it('no deadlock: every suspect can always be interviewed for free', () => {
    for (const suspect of ashgrove.suspects) {
      expect(suspect.topics.filter((t) => !t.requires).length, suspect.id).toBeGreaterThanOrEqual(1);
    }
    // Pressing is also always possible: the starting cards are never taken away.
    expect(ashgrove.startingEvidence.length).toBeGreaterThan(0);
  });

  it('§6: the draft will needs the forced drawer; the blotter needs the will or the telephone pad', () => {
    expect(reduce(ashgrove, initialState(ashgrove), examine('study', 'draftWill')).lastEvent.kind).toBe('rejected');
    expect(reduce(ashgrove, initialState(ashgrove), examine('study', 'blotter')).lastEvent.kind).toBe('rejected');
    expect(play([examine('study', 'forcedDrawer'), examine('study', 'draftWill'), examine('study', 'blotter')]).evidence).toContain('E12');
    expect(play([examine('study', 'telephone'), examine('study', 'blotter')]).evidence).toContain('E12');
  });

  it('§6: Theo’s "desk keys" topic needs the left drawer, and gives T-F', () => {
    const s = play([examine('study', 'leftDrawer'), interview('theo'), { type: 'askTopic', suspectId: 'theo', topicId: 'desk' }]);
    expect(s.evidence).toContain('T-F');
  });

  it('§6: breaking C1–C4 unlocks each suspect’s "secret" topic', () => {
    for (const [suspectId, cId] of [['pell', 'C1'], ['julian', 'C2'], ['victoria', 'C3'], ['clara', 'C4']]) {
      const topic = ashgrove.suspects.find((s) => s.id === suspectId)!.topics.find((t) => t.id === 'secret')!;
      expect(topic.requires).toEqual({ contradictions: [cId] });
    }
  });
});

describe('solvability (exhaustive reachability)', () => {
  it('every card can be obtained', () => {
    expect([...explored.evidence].sort()).toEqual(Object.keys(ashgrove.evidence).sort());
  });

  it('every location opens and every hotspot can be examined', () => {
    expect(openLocations(ashgrove, explored)).toHaveLength(ashgrove.locations.length);
    expect(explored.examined).toHaveLength(ashgrove.locations.flatMap((l) => l.hotspots).length);
  });

  it('every contradiction C1–C8 can be broken', () => {
    expect([...explored.contradictions].sort()).toEqual(['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']);
  });

  it('every topic becomes available', () => {
    const total = ashgrove.suspects.flatMap((s) => s.topics).length;
    expect(explored.topicsHeard).toHaveLength(total);
  });

  it('§7: every innocent can be cleared with cards the player can hold', () => {
    const clearing: Record<string, string[]> = {
      victoria: ['E18', 'T-D', 'T-B', 'T-E', 'E8'],
      julian: ['E8', 'E7', 'E9', 'T-E'],
      clara: ['E1', 'E2', 'T-E', 'E15'],
      pell: ['T-B', 'E13', 'E8'],
    };
    for (const cards of Object.values(clearing)) {
      for (const card of cards) expect(explored.evidence).toContain(card);
    }
  });

  it('every hint can be completed, and the case becomes "ready"', () => {
    for (const hint of ashgrove.hints) expect(isMet(hint.doneWhen, explored), hint.id).toBe(true);
    expect(nextHint(ashgrove, explored)).toBeUndefined();
    expect(isReadyToAccuse(ashgrove, explored)).toBe(true);
  });
});

describe('proving the case', () => {
  it('the critical path proves the case without Upstairs, gated topics, or pressing Theo', () => {
    const s = play([...criticalPath, accuse('theo', proof)]);
    expect(s.outcome).toMatchObject({ kind: 'proven', rating: 'master' });
    expect(s.examined.some((h) => ['claraRoom', 'julianRoom', 'victoriaRoom', 'landing'].includes(h))).toBe(false);
    expect(s.topicsHeard).toEqual(['pell:tonic']);
    expect(s.contradictions).toEqual(['C2']);
  });

  it('opportunity has a second, independent route through Mrs. Pell (C1), without Julian', () => {
    const s = play([
      examine('study', 'forcedDrawer'),
      examine('study', 'draftWill'),
      examine('study', 'blotter'),
      interview('pell'),
      examine('servants', 'backStep'),
      examine('servants', 'laundryHamper'),
      press('pell', 'indoors', 'E13'),
      accuse('theo', { motive: 'E12', means: 'T-B', opportunity: 'T-A', physical: 'E17' }),
    ]);
    expect(s.interviewed).not.toContain('julian');
    expect(s.outcome?.kind).toBe('proven');
  });

  it('every combination of accepted cards proves the case', () => {
    const { slots } = ashgrove.accusation;
    let combos = 0;
    for (const motive of slots.motive.accepts)
      for (const means of slots.means.accepts)
        for (const opportunity of slots.opportunity.accepts)
          for (const physical of slots.physical.accepts) {
            const s = reduce(ashgrove, explored, accuse('theo', { motive, means, opportunity, physical }));
            expect(s.outcome?.kind, `${motive}/${means}/${opportunity}/${physical}`).toBe('proven');
            combos++;
          }
    expect(combos).toBe(6);
  });

  it('readiness lines up with proof: once Gale says "ready", the held cards prove the case', () => {
    const before = play(criticalPath.slice(0, -1));
    expect(isReadyToAccuse(ashgrove, before)).toBe(false);
    const ready = play(criticalPath.slice(-1), before);
    expect(isReadyToAccuse(ashgrove, ready)).toBe(true);
    expect(reduce(ashgrove, ready, accuse('theo', proof)).outcome?.kind).toBe('proven');
  });

  it('readiness requires the physical evidence too (bible v2 four-slot rule)', () => {
    const noLaundry = play(criticalPath.filter((a) => !(a.type === 'examine' && a.hotspotId === 'laundryHamper')));
    expect(isReadyToAccuse(ashgrove, noLaundry)).toBe(false);
    expect(nextHint(ashgrove, noLaundry)?.id).toBe('laundry');
  });

  it('wrong presses never block a solution', () => {
    const wrong = Array(10).fill(press('theo', 'alibi', 'E1'));
    const s = play([interview('theo'), ...wrong, ...criticalPath, accuse('theo', proof)]);
    expect(s.credibility).toBe(0);
    expect(s.outcome).toMatchObject({ kind: 'proven', rating: 'chief' });
  });
});

describe('failed accusations', () => {
  it('accusing any innocent gives Brandt’s rebuttal and reopens the case', () => {
    for (const suspectId of ['victoria', 'julian', 'clara', 'pell']) {
      const s = reduce(ashgrove, explored, accuse(suspectId, proof));
      expect(s.lastEvent).toMatchObject({
        kind: 'accusation',
        result: { kind: 'wrongCulprit', rebuttal: ashgrove.accusation.rebuttals[suspectId] },
      });
      expect(s.outcome).toBeNull();
    }
  });

  it('naming Theo with a missing card fails exactly that slot', () => {
    for (const slot of SLOT_IDS) {
      const s = reduce(ashgrove, explored, accuse('theo', { ...proof, [slot]: undefined }));
      expect(s.lastEvent).toMatchObject({ result: { kind: 'unproven', failedSlots: [slot] } });
    }
  });

  it('near-miss cards get Brandt’s tailored feedback', () => {
    const s = reduce(ashgrove, explored, accuse('theo', { ...proof, motive: 'E8' }));
    expect(s.lastEvent).toMatchObject({
      result: { kind: 'unproven', messages: { motive: "That shows what he'd lose, but why was he struck out?" } },
    });
  });

  it('guessing Theo with no evidence is not a win', () => {
    const s = reduce(ashgrove, initialState(ashgrove), accuse('theo', {}));
    expect(s.lastEvent).toMatchObject({ result: { kind: 'unproven', failedSlots: [...SLOT_IDS] } });
    expect(s.outcome).toBeNull();
  });
});

describe('statistics', () => {
  it('counts 8 contradictions and 4 secrets to uncover', () => {
    expect(caseStats(ashgrove, explored)).toEqual({
      contradictionsFound: 8,
      contradictionsTotal: 8,
      secretsUncovered: 4,
      secretsTotal: 4,
    });
    expect(caseStats(ashgrove, play(criticalPath))).toMatchObject({ contradictionsFound: 1, secretsUncovered: 1 });
  });
});
