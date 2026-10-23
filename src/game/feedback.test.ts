import { describe, expect, it } from 'vitest';
import { ashgrove } from '../case/ashgrove';
import { exploreAll, initialState, reduce, type GameAction, type GameState } from '../engine';
import { RATING_LABELS, accusationFeedback, pressFeedback, topicFeedback } from './feedback';

const MAX = ashgrove.startingCredibility;
const run = (actions: GameAction[], from: GameState = initialState(ashgrove)) =>
  actions.reduce((s, a) => reduce(ashgrove, s, a), from);

const atJulian = run([
  { type: 'examine', locationId: 'study', hotspotId: 'deskFloor' },
  { type: 'askTopic', suspectId: 'julian', topicId: 'argument' },
]);

describe('pressFeedback', () => {
  it('a correct card: "Contradiction!", the confession, and the new testimony card', () => {
    const s = reduce(ashgrove, atJulian, { type: 'press', suspectId: 'julian', statementId: 'study', evidenceId: 'E10' });
    const fb = pressFeedback(ashgrove, s.lastEvent, MAX)!;
    expect(fb.tone).toBe('success');
    expect(fb.heading).toBe('Contradiction!');
    expect(fb.lines[0]).toMatch(/I went into the study/);
    expect(fb.gained.map((c) => c.id)).toEqual(['T-C']);
    expect(fb.credibilityNote).toBeUndefined();
  });

  it('a wrong card: the suspect’s rebuff and the credibility cost', () => {
    const s = reduce(ashgrove, atJulian, { type: 'press', suspectId: 'julian', statementId: 'study', evidenceId: 'E1' });
    const fb = pressFeedback(ashgrove, s.lastEvent, MAX)!;
    expect(fb.tone).toBe('fail');
    expect(fb.lines).toEqual(["Is that it? I've had worse from my bookmaker."]);
    expect(fb.credibilityNote).toBe('Credibility −1 (4/5)');
  });

  it('pressing a true statement is a wrong guess, never a missed lie', () => {
    const s = reduce(ashgrove, atJulian, { type: 'press', suspectId: 'julian', statementId: 'dressing', evidenceId: 'E10' });
    expect(pressFeedback(ashgrove, s.lastEvent, MAX)?.tone).toBe('fail');
  });

  it('an already-exposed lie: neutral, no cost', () => {
    const broken = reduce(ashgrove, atJulian, { type: 'press', suspectId: 'julian', statementId: 'study', evidenceId: 'E10' });
    const again = reduce(ashgrove, broken, { type: 'press', suspectId: 'julian', statementId: 'study', evidenceId: 'E1' });
    const fb = pressFeedback(ashgrove, again.lastEvent, MAX)!;
    expect(fb.tone).toBe('neutral');
    expect(fb.credibilityNote).toBeUndefined();
    expect(again.credibility).toBe(MAX);
  });

  it('ignores events that are not presses', () => {
    expect(pressFeedback(ashgrove, atJulian.lastEvent, MAX)).toBeNull();
  });
});

describe('topicFeedback', () => {
  it('shows the lines and any testimony gained', () => {
    const s = run(
      [
        { type: 'examine', locationId: 'study', hotspotId: 'leftDrawer' },
        { type: 'askTopic', suspectId: 'theo', topicId: 'uncle' },
        { type: 'askTopic', suspectId: 'theo', topicId: 'desk' },
      ],
    );
    const fb = topicFeedback(ashgrove, s.lastEvent, 'The desk keys')!;
    expect(fb.heading).toBe('The desk keys');
    expect(fb.gained.map((c) => c.id)).toEqual(['T-F']);
  });
});

describe('accusationFeedback', () => {
  const explored = exploreAll(ashgrove);
  const proof = { motive: 'E12', means: 'E14', opportunity: 'T-C', physical: 'E17' };
  const accuse = (suspectId: string, slots: Record<string, string | undefined>) =>
    reduce(ashgrove, explored, { type: 'accuse', accusation: { suspectId, slots } });

  it('success: "Case proven" with the rating', () => {
    const s = accuse('theo', proof);
    if (s.lastEvent.kind !== 'accusation') throw new Error('expected an accusation');
    const fb = accusationFeedback(s.lastEvent.result, MAX, s.credibility);
    expect(fb).toMatchObject({ tone: 'success', heading: 'Case proven', lines: [RATING_LABELS.master] });
  });

  it('wrong culprit: Brandt’s rebuttal and the credibility cost', () => {
    const s = accuse('julian', proof);
    if (s.lastEvent.kind !== 'accusation') throw new Error('expected an accusation');
    const fb = accusationFeedback(s.lastEvent.result, MAX, s.credibility);
    expect(fb.tone).toBe('fail');
    expect(fb.heading).toBe('Mr. Brandt is not convinced');
    expect(fb.lines).toEqual([ashgrove.accusation.rebuttals.julian]);
    expect(fb.credibilityNote).toBe('Credibility −1 (4/5). The case stays open.');
  });

  it('right culprit, weak case: names each unsupported part with Brandt’s reason', () => {
    const s = accuse('theo', { ...proof, motive: 'E8', physical: undefined });
    if (s.lastEvent.kind !== 'accusation') throw new Error('expected an accusation');
    const fb = accusationFeedback(s.lastEvent.result, MAX, s.credibility);
    expect(fb.heading).toBe("It won't stand up");
    expect(fb.lines).toEqual([
      "Motive: That shows what he'd lose, but why was he cut out of the will?",
      'Physical Evidence: Nothing physical ties him to the poison.',
    ]);
  });
});
