import { describe, expect, it } from 'vitest';
import { ashgrove } from '../case/ashgrove';
import { initialState, reduce, type GameAction, type GameState } from '../engine';
import { newlyAvailableTopics, newlyRevealedHotspots, revealMessage } from './announcements';

const play = (actions: GameAction[], from: GameState = initialState(ashgrove)) =>
  actions.reduce((s, a) => reduce(ashgrove, s, a), from);
const examine = (locationId: string, hotspotId: string): GameAction => ({ type: 'examine', locationId, hotspotId });

/** Applies one action and reports what it revealed. */
const revealedBy = (action: GameAction, from: GameState) => {
  const next = reduce(ashgrove, from, action);
  return { next, revealed: newlyRevealedHotspots(ashgrove, from, next) };
};
const ids = (r: ReturnType<typeof newlyRevealedHotspots>) => r.flatMap((x) => x.hotspots.map((h) => `${x.location.id}:${h.id}`));

describe('newlyRevealedHotspots', () => {
  it('announces the papers when the forced drawer is examined', () => {
    const { revealed } = revealedBy(examine('study', 'forcedDrawer'), initialState(ashgrove));
    expect(ids(revealed)).toEqual(['study:draftWill']);
    expect(revealMessage(revealed[0])).toBe('Something new to examine in the Study: Papers in the drawer.');
  });

  it('announces the blotter when the will is read', () => {
    const { revealed } = revealedBy(examine('study', 'draftWill'), play([examine('study', 'forcedDrawer')]));
    expect(ids(revealed)).toEqual(['study:blotter']);
    expect(revealMessage(revealed[0])).toBe('Something new to examine in the Study: Desk blotter.');
  });

  it('announces the blotter only once, whichever note reveals it first', () => {
    const afterPhone = revealedBy(examine('study', 'telephone'), initialState(ashgrove));
    expect(ids(afterPhone.revealed)).toEqual(['study:blotter']);
    // Reading the will later reveals nothing new.
    const s = play([examine('study', 'forcedDrawer')], afterPhone.next);
    expect(ids(revealedBy(examine('study', 'draftWill'), s).revealed)).toEqual([]);
  });

  it('says nothing when an already examined hotspot is revisited', () => {
    const s = play([examine('study', 'forcedDrawer'), examine('study', 'draftWill')]);
    for (const action of [examine('study', 'forcedDrawer'), examine('study', 'draftWill'), examine('study', 'blotter')]) {
      expect(ids(revealedBy(action, s).revealed)).toEqual([]);
    }
  });

  it('says nothing for actions that reveal no hotspot', () => {
    const fresh = initialState(ashgrove);
    for (const action of [
      examine('dining', 'window'),
      examine('dining', 'fernPlanter'),
      { type: 'askTopic', suspectId: 'clara', topicId: 'father' } as GameAction,
      { type: 'press', suspectId: 'clara', statementId: 'alibi', evidenceId: 'E1' } as GameAction,
      { type: 'accuse', accusation: { suspectId: 'pell', slots: {} } } as GameAction,
    ]) {
      expect(ids(revealedBy(action, fresh).revealed)).toEqual([]);
    }
  });

  it('says nothing for a rejected action (locked hotspot)', () => {
    expect(ids(revealedBy(examine('study', 'blotter'), initialState(ashgrove)).revealed)).toEqual([]);
  });

  it('leaves a newly unlocked room to its own announcement', () => {
    // Interviewing Mrs. Pell opens the Servants' Hall; its hotspots are not listed one by one.
    const { revealed } = revealedBy({ type: 'askTopic', suspectId: 'pell', topicId: 'tonic' }, initialState(ashgrove));
    expect(revealed).toEqual([]);
  });

  it('only ever names hotspot labels, never evidence or suspects', () => {
    const s = play([examine('study', 'forcedDrawer')]);
    const message = revealMessage(revealedBy(examine('study', 'draftWill'), s).revealed[0]);
    for (const spoiler of ['Theo', 'Lyle', 'Bank', 'B.L.', 'E12']) expect(message).not.toContain(spoiler);
  });
});

describe('newlyAvailableTopics', () => {
  const suspect = (id: string) => ashgrove.suspects.find((s) => s.id === id)!;

  it('finds the topic a contradiction unlocks', () => {
    const before = play([examine('study', 'deskFloor')]);
    const after = reduce(ashgrove, before, { type: 'press', suspectId: 'julian', statementId: 'study', evidenceId: 'E10' });
    expect(newlyAvailableTopics(suspect('julian'), before, after).map((t) => t.label)).toEqual(['The break-in']);
  });

  it('finds nothing for a wrong press or a repeated press', () => {
    const before = play([examine('study', 'deskFloor')]);
    const wrong = reduce(ashgrove, before, { type: 'press', suspectId: 'julian', statementId: 'study', evidenceId: 'E1' });
    expect(newlyAvailableTopics(suspect('julian'), before, wrong)).toEqual([]);
    const broken = reduce(ashgrove, before, { type: 'press', suspectId: 'julian', statementId: 'study', evidenceId: 'E10' });
    const again = reduce(ashgrove, broken, { type: 'press', suspectId: 'julian', statementId: 'study', evidenceId: 'E10' });
    expect(newlyAvailableTopics(suspect('julian'), broken, again)).toEqual([]);
  });

  it("does not report another suspect's topics", () => {
    const before = play([examine('study', 'deskFloor')]);
    const after = reduce(ashgrove, before, { type: 'press', suspectId: 'julian', statementId: 'study', evidenceId: 'E10' });
    expect(newlyAvailableTopics(suspect('theo'), before, after)).toEqual([]);
  });
});
