import { describe, expect, it } from 'vitest';
import { miniCase } from './__fixtures__/miniCase';
import { isReadyToAccuse, nextHint } from './selectors';
import { exploreAll } from './solvability';
import { initialState } from './state';
import { fullInvestigation, play } from './testUtils';
import type { CaseData } from './types';

describe('exploreAll', () => {
  it('reaches every card, hotspot and contradiction in the fixture', () => {
    const s = exploreAll(miniCase);
    expect([...s.evidence].sort()).toEqual(Object.keys(miniCase.evidence).sort());
    expect(s.examined).toHaveLength(miniCase.locations.flatMap((l) => l.hotspots).length);
    expect([...s.contradictions].sort()).toEqual(['cButler', 'cMaid']);
  });

  it('makes no wrong moves', () => {
    const s = exploreAll(miniCase);
    expect(s.credibility).toBe(miniCase.startingCredibility);
    expect(s.wrongPresentations).toBe(0);
  });

  it('detects content that can never be reached', () => {
    const broken: CaseData = structuredClone(miniCase);
    // Circular: the shelf needs the receipt, which only the shelf gives.
    broken.locations[1].hotspots[0].requires = { evidence: ['receipt'] };
    const s = exploreAll(broken);
    expect(s.evidence).not.toContain('receipt');
    expect(s.contradictions).not.toContain('cMaid');
  });
});

describe('hints', () => {
  it('returns the first unfinished hint whose prerequisites are met', () => {
    expect(nextHint(miniCase, initialState(miniCase))?.id).toBe('desk');

    const afterDesk = play([
      { type: 'examine', locationId: 'hall', hotspotId: 'coatStand' },
      { type: 'examine', locationId: 'hall', hotspotId: 'desk' },
    ]);
    // The maid hint needs her interview first.
    expect(nextHint(miniCase, afterDesk)).toBeUndefined();

    const interviewed = play([{ type: 'askTopic', suspectId: 'maid', topicId: 'evening' }], miniCase, afterDesk);
    expect(nextHint(miniCase, interviewed)?.id).toBe('maid');
  });

  it('runs out once everything is done', () => {
    expect(nextHint(miniCase, play(fullInvestigation))).toBeUndefined();
  });
});

describe('isReadyToAccuse', () => {
  it('follows the readyWhen condition', () => {
    expect(isReadyToAccuse(miniCase, initialState(miniCase))).toBe(false);
    expect(isReadyToAccuse(miniCase, play(fullInvestigation))).toBe(true);
  });
});
