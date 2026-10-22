import { describe, expect, it } from 'vitest';
import { miniCase } from './__fixtures__/miniCase';
import { availableTopics, isMet, openLocations, visibleHotspots } from './selectors';
import { initialState } from './state';
import type { GameState } from './types';

const base = initialState(miniCase);
const withState = (patch: Partial<GameState>): GameState => ({ ...base, ...patch });

describe('isMet', () => {
  it('treats missing and empty conditions as met', () => {
    expect(isMet(undefined, base)).toBe(true);
    expect(isMet({}, base)).toBe(true);
  });

  it('requires every listed id (AND)', () => {
    const s = withState({ evidence: ['note', 'glove'] });
    expect(isMet({ evidence: ['note', 'glove'] }, s)).toBe(true);
    expect(isMet({ evidence: ['note', 'ledger'] }, s)).toBe(false);
  });

  it('requires every field to hold', () => {
    const s = withState({ evidence: ['glove'], interviewed: ['maid'] });
    expect(isMet({ evidence: ['glove'], interviewed: ['maid'] }, s)).toBe(true);
    expect(isMet({ evidence: ['glove'], interviewed: ['cook'] }, s)).toBe(false);
  });

  it('checks examined hotspots and broken contradictions', () => {
    const s = withState({ examined: ['clock'], contradictions: ['cMaid'] });
    expect(isMet({ examined: ['clock'], contradictions: ['cMaid'] }, s)).toBe(true);
    expect(isMet({ contradictions: ['cButler'] }, s)).toBe(false);
  });

  it('supports OR through anyOf, combined with other fields', () => {
    const cond = { interviewed: ['maid'], anyOf: [{ evidence: ['ledger'] }, { contradictions: ['cButler'] }] };
    expect(isMet(cond, withState({ interviewed: ['maid'], evidence: ['ledger'] }))).toBe(true);
    expect(isMet(cond, withState({ interviewed: ['maid'], contradictions: ['cButler'] }))).toBe(true);
    expect(isMet(cond, withState({ interviewed: ['maid'] }))).toBe(false);
    expect(isMet(cond, withState({ evidence: ['ledger'] }))).toBe(false);
  });
});

describe('visibility selectors', () => {
  it('lists only open locations', () => {
    expect(openLocations(miniCase, base).map((l) => l.id)).toEqual(['hall']);
    const s = withState({ interviewed: ['maid'], evidence: ['ledger'] });
    expect(openLocations(miniCase, s).map((l) => l.id)).toEqual(['hall', 'pantry', 'cellar']);
  });

  it('hides gated hotspots and topics until their condition is met', () => {
    const hall = miniCase.locations[0];
    expect(visibleHotspots(hall, base).map((h) => h.id)).toEqual(['coatStand', 'clock']);
    expect(visibleHotspots(hall, withState({ evidence: ['glove'] })).map((h) => h.id)).toContain('desk');

    const cook = miniCase.suspects[2];
    expect(availableTopics(cook, base)).toEqual([]);
    expect(availableTopics(cook, withState({ evidence: ['receipt'] })).map((t) => t.id)).toEqual(['shopping']);
  });
});
