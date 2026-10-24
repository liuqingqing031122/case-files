import { describe, expect, it } from 'vitest';
import { ashgrove } from '../case/ashgrove';
import { SLOT_IDS } from '../engine';
import { SLOT_LABELS } from './feedback';
import { GUIDE_ENTRY_LABEL, GUIDE_SECTIONS, GUIDE_TITLE } from './guide';

const sectionText = (heading: string) => {
  const s = GUIDE_SECTIONS.find((x) => x.heading === heading);
  if (!s) throw new Error(`missing section ${heading}`);
  return [...(s.paragraphs ?? []), ...(s.points ?? []).map((p) => `${p.lead ?? ''} ${p.text}`), s.note ? `${s.note.label} ${s.note.text}` : ''].join(' ');
};
const allText = [GUIDE_TITLE, GUIDE_ENTRY_LABEL, ...GUIDE_SECTIONS.map((s) => `${s.heading} ${sectionText(s.heading)}`)].join(' ');

describe("Detective's Guide content", () => {
  it('covers the four core activities, plus the goal and help', () => {
    expect(GUIDE_SECTIONS.map((s) => s.heading)).toEqual([
      'Your goal',
      'Search the rooms',
      'Question the suspects',
      'Your Case File',
      'Make your accusation',
      'Stuck?',
    ]);
  });

  it('says plainly that not every card contradicts testimony', () => {
    expect(sectionText('Question the suspects')).toMatch(/most cards don’t contradict anyone/);
    expect(sectionText('Question the suspects')).toMatch(/Most statements are true/);
  });

  it('says the Case File remembers everything', () => {
    expect(sectionText('Your Case File')).toMatch(/never need to memorise anything/);
  });

  it('names the four accusation parts exactly as the Accuse screen does', () => {
    const leads = GUIDE_SECTIONS.find((s) => s.heading === 'Make your accusation')!.points!.map((p) => p.lead);
    expect(leads).toEqual(SLOT_IDS.map((slot) => SLOT_LABELS[slot].title));
  });

  it('stresses that each card must prove its part, not merely seem suspicious', () => {
    const text = sectionText('Make your accusation');
    expect(text).toMatch(/Each card must prove its part/);
    expect(text).toMatch(/only seems suspicious is not enough/);
    expect(text).toMatch(/try again as often as you need/);
  });

  it('uses an example from outside the case that cannot be mistaken for a clue', () => {
    expect(sectionText('Make your accusation')).toMatch(/example from outside this case: a train ticket/);
    // Nothing in the Ashgrove case mentions trains or tickets (whole words; "trained" is unrelated).
    expect(JSON.stringify(ashgrove)).not.toMatch(/\b(trains?|tickets?)\b/i);
  });

  it('reveals no suspect, culprit, card or clue', () => {
    const forbidden = [
      ...ashgrove.suspects.flatMap((s) => [s.name, ...s.name.split(' ').filter((w) => w.length > 3 && !/^(Lady|Mrs\.)$/.test(w))]),
      ...Object.values(ashgrove.evidence).map((e) => e.name),
      'Theo', 'Lyle', 'culprit is', 'bank', 'cufflink', 'fern', 'hamper', 'tincture', 'digitalis',
    ];
    for (const term of forbidden) expect(allText, term).not.toContain(term);
    expect(allText).not.toMatch(/\bE\d{1,2}\b|\bT-[A-F]\b/);
  });

  it('stays concise', () => {
    expect(allText.split(/\s+/).length).toBeLessThan(380);
  });

  it('the in-game entry label is explicit', () => {
    expect(GUIDE_ENTRY_LABEL).toBe("How to Play · Detective's Guide");
  });
});
