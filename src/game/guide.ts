// The Detective's Guide: how to play, in plain modern English. Spoiler-free:
// it never names a suspect, clue or location, and its one example comes from
// outside this case. The accusation parts reuse SLOT_LABELS so they always
// match the Accuse screen.
import { SLOT_LABELS } from './feedback';

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  /** Bulleted points, optionally with a bold lead-in (followed by a colon when `colon` is set). */
  points?: { lead?: string; colon?: boolean; text: string }[];
  /** A short highlighted note (a tip or example). */
  note?: { label: string; text: string };
}

export const GUIDE_TITLE = "Detective's Guide";
export const GUIDE_ENTRY_LABEL = "How to Play · Detective's Guide";

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    heading: 'Your goal',
    paragraphs: ['Find out who killed Sir Edmund, then prove it to Mr. Brandt with evidence.'],
  },
  {
    heading: 'Search the rooms',
    paragraphs: [
      'Tap a glowing point, or pick from the list under the picture. Some spots give you a clue card; others are just observations. New rooms and spots open as the investigation goes on.',
    ],
  },
  {
    heading: 'Question the suspects',
    points: [
      { lead: 'Ask about', text: 'topics as often as you like. It costs nothing.' },
      {
        lead: 'Challenge a statement',
        text: 'when a card in your Case File proves it false. You will learn the truth, and often get a new testimony card.',
      },
      {
        lead: 'Most statements are true, and most cards don’t contradict anyone.',
        text: 'Many cards are simply clues for your final case.',
      },
      { text: 'A wrong challenge costs a little credibility, which only affects your final rating.' },
    ],
  },
  {
    heading: 'Your Case File',
    paragraphs: [
      'Every clue and every confession you collect is kept in your Case File, so you never need to memorise anything. Testimony cards can be presented just like objects.',
    ],
  },
  {
    heading: 'Make your accusation',
    paragraphs: ['Name the culprit, then choose one card for each part of the case:'],
    points: [
      { lead: SLOT_LABELS.motive.title, colon: true, text: 'why they would do it.' },
      { lead: SLOT_LABELS.means.title, colon: true, text: 'how they were able to carry it out.' },
      { lead: SLOT_LABELS.opportunity.title, colon: true, text: 'when they had the chance.' },
      { lead: SLOT_LABELS.physical.title, colon: true, text: 'what physically connects them to the crime.' },
    ],
    note: {
      label: 'Each card must prove its part',
      text: 'A card that only seems suspicious is not enough. For each part, ask: “What does this card actually prove?” An example from outside this case: a train ticket might show where someone was at a certain time, but it doesn’t prove why they did anything. If your case is weak, Mr. Brandt tells you which parts need better evidence, and you can try again as often as you need.',
    },
  },
  {
    heading: 'Stuck?',
    paragraphs: ['Press Ask Gale for a hint. Each time you ask, the hint becomes clearer.'],
  },
];
