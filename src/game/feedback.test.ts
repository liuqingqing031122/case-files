import { describe, expect, it } from 'vitest';
import { ashgrove } from '../case/ashgrove';
import { exploreAll, initialState, reduce, type GameAction, type GameState } from '../engine';
import { CHIEF_MAX_FAILED, MASTER_MIN_CREDIBILITY, rate } from '../engine/accusation';
import {
  ACCUSE_REMINDER,
  RATING_CRITERIA,
  RATING_EXPLANATION,
  RATING_LABELS,
  accusationFeedback,
  credibilityChangeNote,
  pressFeedback,
  topicFeedback,
} from './feedback';
import { newlyAvailableTopics } from './announcements';

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

describe('M7 feedback additions', () => {
  it('a contradiction lists the topics it opened', () => {
    const julian = ashgrove.suspects.find((x) => x.id === 'julian')!;
    const s = reduce(ashgrove, atJulian, { type: 'press', suspectId: 'julian', statementId: 'study', evidenceId: 'E10' });
    const fb = pressFeedback(ashgrove, s.lastEvent, MAX, newlyAvailableTopics(julian, atJulian, s))!;
    expect(fb.newTopics?.map((t) => t.label)).toEqual(['The break-in']);
  });

  it('wrong presses never list topics', () => {
    const s = reduce(ashgrove, atJulian, { type: 'press', suspectId: 'julian', statementId: 'study', evidenceId: 'E1' });
    expect(pressFeedback(ashgrove, s.lastEvent, MAX)?.newTopics).toBeUndefined();
  });

  it('the rating criteria text matches the real rating rules', () => {
    expect(RATING_CRITERIA).toContain(`credibility of ${MASTER_MIN_CREDIBILITY} or more`);
    expect(RATING_CRITERIA).toContain(`no more than ${CHIEF_MAX_FAILED} failed accusation`);
    expect(rate(0, MASTER_MIN_CREDIBILITY)).toBe('master');
    expect(rate(CHIEF_MAX_FAILED, 5)).toBe('chief');
    expect(rate(CHIEF_MAX_FAILED + 1, 5)).toBe('dogged');
  });

  it('E6 and E4 in the physical slot get tailored near-misses; accepted cards are unchanged', () => {
    const explored = exploreAll(ashgrove);
    const base = { motive: 'E12', means: 'E14', opportunity: 'T-C' };
    const messages: Record<string, string> = {
      E6: 'That bottle proves the poison was there, not who poured it.',
      E4: 'The glass shows how he died, not who stood beside it.',
    };
    for (const [card, message] of Object.entries(messages)) {
      const s = reduce(ashgrove, explored, { type: 'accuse', accusation: { suspectId: 'theo', slots: { ...base, physical: card } } });
      expect(s.lastEvent).toMatchObject({ result: { kind: 'unproven', failedSlots: ['physical'], messages: { physical: message } } });
    }
    expect(ashgrove.accusation.slots.physical.accepts).toEqual(['E17']);
  });

  it('none of the new onboarding text names the culprit', () => {
    const texts = [...ashgrove.story.intro, RATING_CRITERIA, ...Object.values(ashgrove.accusation.slots.physical.nearMisses ?? {})];
    for (const t of texts) expect(t).not.toMatch(/Theo|Lyle|T\.L\./);
  });
});

describe('credibility explanations', () => {
  it('the briefing explains the final rating and that 0 credibility never blocks the case', () => {
    const text = RATING_EXPLANATION.lines.join(' ');
    expect(RATING_EXPLANATION.title).toBe('Detective Rating');
    expect(text).toMatch(/rated when you solve the case/);
    expect(text).toMatch(/Incorrect testimony challenges and failed accusations reduce your credibility/);
    expect(text).toMatch(/reaching 0 will never prevent you from solving the case/);
    expect(text).toMatch(/retry accusations as often as you need/);
  });

  it('the briefing does not reveal rating thresholds', () => {
    const text = RATING_EXPLANATION.lines.join(' ');
    for (const label of Object.values(RATING_LABELS)) expect(text).not.toContain(label);
    expect(text).not.toMatch(/\b4\b|first attempt|no more than/);
  });

  it('the Accuse screen reminder explains the consequence and that retries are allowed', () => {
    expect(ACCUSE_REMINDER).toBe(
      'Failed accusations lower your credibility and may affect your final rating, but you can always try again.',
    );
  });
});

describe('credibilityChangeNote', () => {
  it('a normal drop keeps the existing wording', () => {
    expect(credibilityChangeNote(3, 2, 5)).toBe('Credibility −1 (2/5)');
    expect(credibilityChangeNote(5, 4, 5, '. The case stays open.')).toBe('Credibility −1 (4/5). The case stays open.');
  });

  it('dropping from 1 to 0 explains the consequence once', () => {
    expect(credibilityChangeNote(1, 0, 5)).toBe(
      'Credibility −1 (0/5). Your credibility is exhausted, but the investigation remains open. You can continue investigating and making accusations. Credibility only affects your final rating.',
    );
  });

  it('already at 0: no false "−1", and the long explanation is not repeated', () => {
    const note = credibilityChangeNote(0, 0, 5, '. The case stays open.');
    expect(note).toBe('Credibility remains at 0/5. The investigation is still open.');
    expect(note).not.toContain('−1');
    expect(note).not.toContain('exhausted');
  });
});

describe('credibility feedback in play', () => {
  const wrongPress = { type: 'press', suspectId: 'julian', statementId: 'study', evidenceId: 'E1' } as const;

  it('incorrect challenges: 1 → 0 explains, then 0 → 0 says it remains', () => {
    let s = run(Array(4).fill(wrongPress), atJulian);
    expect(s.credibility).toBe(1);
    const before = s.credibility;
    s = reduce(ashgrove, s, wrongPress);
    expect(pressFeedback(ashgrove, s.lastEvent, MAX, [], before)?.credibilityNote).toMatch(/^Credibility −1 \(0\/5\)\. Your credibility is exhausted/);
    const again = reduce(ashgrove, s, wrongPress);
    expect(again.credibility).toBe(0);
    expect(pressFeedback(ashgrove, again.lastEvent, MAX, [], s.credibility)?.credibilityNote).toBe(
      'Credibility remains at 0/5. The investigation is still open.',
    );
  });

  it('failed accusations: 1 → 0 explains, then every later failure says it remains', () => {
    const explored = exploreAll(ashgrove);
    const wrong = { type: 'accuse', accusation: { suspectId: 'pell', slots: {} } } as const;
    let s = run(Array(4).fill(wrong), explored);
    expect(s.credibility).toBe(1);
    for (let i = 0; i < 4; i++) {
      const before = s.credibility;
      s = reduce(ashgrove, s, wrong);
      if (s.lastEvent.kind !== 'accusation') throw new Error('expected an accusation');
      const note = accusationFeedback(s.lastEvent.result, MAX, s.credibility, before).credibilityNote!;
      if (i === 0) expect(note).toMatch(/^Credibility −1 \(0\/5\)\. Your credibility is exhausted/);
      else expect(note).toBe('Credibility remains at 0/5. The investigation is still open.');
    }
    expect(s.failedAccusations).toBe(8);
    expect(s.outcome).toBeNull();
  });
});
