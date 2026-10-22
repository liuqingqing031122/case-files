import { describe, expect, it } from 'vitest';
import { miniCase } from './__fixtures__/miniCase';
import { caseStats, rate } from './accusation';
import { reduce } from './state';
import { fullInvestigation, play, winningAccusation } from './testUtils';
import type { GameAction } from './types';

const investigated = play(fullInvestigation);

const accuse = (suspectId: string, slots: Record<string, string>): GameAction => ({
  type: 'accuse',
  accusation: { suspectId, slots },
});

describe('accusation outcomes', () => {
  it('wrong culprit: rebuttal, credibility penalty, case reopens', () => {
    const s = reduce(miniCase, investigated, accuse('maid', { motive: 'ledger' }));
    expect(s.lastEvent).toEqual({
      kind: 'accusation',
      result: { kind: 'wrongCulprit', suspectId: 'maid', rebuttal: 'The maid was at market.' },
    });
    expect(s.credibility).toBe(4);
    expect(s.failedAccusations).toBe(1);
    expect(s.outcome).toBeNull();
  });

  it('right culprit with weak proof is "unproven" and names the failing slots', () => {
    const s = reduce(miniCase, investigated, accuse('butler', { motive: 'ledger', means: 'glove' }));
    expect(s.lastEvent).toEqual({
      kind: 'accusation',
      result: {
        kind: 'unproven',
        failedSlots: ['opportunity', 'physical'],
        messages: {
          opportunity: 'When could he have done it?',
          physical: 'Nothing physical ties him to it.',
        },
      },
    });
    expect(s.credibility).toBe(4);
    expect(s.failedAccusations).toBe(1);
    expect(s.outcome).toBeNull();
  });

  it('uses near-miss feedback for plausible but insufficient cards', () => {
    const s = reduce(
      miniCase,
      investigated,
      accuse('butler', { motive: 'note', means: 'glove', opportunity: 'tMaid', physical: 'mud' }),
    );
    expect(s.lastEvent).toMatchObject({
      result: { kind: 'unproven', failedSlots: ['motive'], messages: { motive: 'The note says what happened, not why.' } },
    });
  });

  it('a card in the wrong slot does not count', () => {
    const s = reduce(
      miniCase,
      investigated,
      accuse('butler', { motive: 'mud', means: 'glove', opportunity: 'tMaid', physical: 'ledger' }),
    );
    expect(s.lastEvent).toMatchObject({ result: { kind: 'unproven', failedSlots: ['motive', 'physical'] } });
  });

  it('proves the case with all four slots supported, and closes it', () => {
    const s = reduce(miniCase, investigated, winningAccusation);
    expect(s.outcome).toEqual({
      kind: 'proven',
      rating: 'master',
      stats: { contradictionsFound: 1, contradictionsTotal: 2, innocentsCleared: 1, innocentsTotal: 1 },
    });
    expect(s.credibility).toBe(5);

    const after = reduce(miniCase, s, { type: 'examine', locationId: 'hall', hotspotId: 'clock' });
    expect(after.lastEvent).toEqual({ kind: 'rejected', reason: 'The case is closed.' });
    expect(reduce(miniCase, s, { type: 'reset' }).outcome).toBeNull();
  });

  it('accepts any listed card for a slot', () => {
    const s = play(
      [
        { type: 'openInterview', suspectId: 'cook' },
        { type: 'askTopic', suspectId: 'cook', topicId: 'shopping' },
        accuse('butler', { motive: 'ledger', means: 'tCook', opportunity: 'tMaid', physical: 'mud' }),
      ],
      miniCase,
      investigated,
    );
    expect(s.outcome?.kind).toBe('proven');
  });

  it('can always retry after failures', () => {
    const s = play(
      [accuse('maid', {}), accuse('cook', {}), accuse('butler', {}), winningAccusation],
      miniCase,
      investigated,
    );
    expect(s.failedAccusations).toBe(3);
    expect(s.outcome).toMatchObject({ kind: 'proven', rating: 'dogged' });
  });

  it('rejects submissions with cards the player does not hold, with no penalty', () => {
    const s = play([winningAccusation]);
    expect(s.lastEvent.kind).toBe('rejected');
    expect(s.credibility).toBe(5);
    expect(s.failedAccusations).toBe(0);
  });
});

describe('rating', () => {
  it('master needs a first-time proof with credibility of at least 4', () => {
    expect(rate(0, 5)).toBe('master');
    expect(rate(0, 4)).toBe('master');
    expect(rate(0, 3)).toBe('chief');
  });

  it('chief allows one failed submission; more is dogged', () => {
    expect(rate(1, 5)).toBe('chief');
    expect(rate(2, 5)).toBe('dogged');
  });

  it('end-to-end: one failure then proof gives chief', () => {
    const s = play([accuse('maid', {}), winningAccusation], miniCase, investigated);
    expect(s.outcome?.rating).toBe('chief');
  });
});

describe('caseStats', () => {
  it('counts contradictions and cleared innocents (only innocents who have lies)', () => {
    expect(caseStats(miniCase, play([]))).toEqual({
      contradictionsFound: 0,
      contradictionsTotal: 2,
      innocentsCleared: 0,
      innocentsTotal: 1,
    });
  });
});
