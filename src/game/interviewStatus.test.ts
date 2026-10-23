import { describe, expect, it } from 'vitest';
import { ashgrove } from '../case/ashgrove';
import { initialState, openLocations, reduce, type GameAction, type GameState } from '../engine';
import { INTERVIEW_STATUS_LABELS, interviewStatus } from './interviewStatus';

const run = (actions: GameAction[], from: GameState = initialState(ashgrove)) =>
  actions.reduce((s, a) => reduce(ashgrove, s, a), from);
const pell = ashgrove.suspects.find((s) => s.id === 'pell')!;
const ask = (topicId: string): GameAction => ({ type: 'askTopic', suspectId: 'pell', topicId });

describe('interviewStatus', () => {
  it('is "not questioned" before any topic or press', () => {
    expect(interviewStatus(pell, initialState(ashgrove))).toBe('notQuestioned');
  });

  it('is "more to ask" after one topic while other open topics remain, and the room still unlocks', () => {
    const s = run([ask('tonic')]);
    expect(interviewStatus(pell, s)).toBe('moreToAsk');
    // The engine rule is unchanged: one topic is enough to open the Servants' Hall.
    expect(openLocations(ashgrove, s).map((l) => l.id)).toContain('servants');
  });

  it('pressing without asking still leaves topics to ask', () => {
    const s = run([{ type: 'press', suspectId: 'pell', statementId: 'indoors', evidenceId: 'E1' }]);
    expect(interviewStatus(pell, s)).toBe('moreToAsk');
  });

  it('is "nothing more" once every currently open topic is asked, ignoring locked ones', () => {
    const s = run([ask('tonic'), ask('household')]);
    // Pell's "Tom" topic is still locked, but the status does not hint at it.
    expect(interviewStatus(pell, s)).toBe('nothingMore');
  });

  it('returns to "more to ask" when a new topic unlocks', () => {
    const s = run([
      ask('tonic'),
      ask('household'),
      { type: 'examine', locationId: 'servants', hotspotId: 'backStep' },
      { type: 'press', suspectId: 'pell', statementId: 'indoors', evidenceId: 'E13' },
    ]);
    expect(interviewStatus(pell, s)).toBe('moreToAsk');
    expect(interviewStatus(pell, run([ask('secret')], s))).toBe('nothingMore');
  });

  it('uses natural labels, with no counts', () => {
    for (const label of Object.values(INTERVIEW_STATUS_LABELS)) expect(label).not.toMatch(/\d/);
  });
});
