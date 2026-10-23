// A tiny case for engine tests only. Deliberately not Ashgrove Manor, so
// tests exercise the rules rather than the story.
import type { CaseData } from '../types';

const card = (id: string, name: string, kind: 'item' | 'testimony' = 'item') => ({
  id,
  name,
  kind,
  description: [`${name}.`],
});

export const miniCase: CaseData = {
  id: 'mini',
  title: 'The Missing Brooch',
  startingEvidence: ['note'],
  startingCredibility: 5,
  evidence: {
    note: card('note', 'Police note'),
    glove: card('glove', 'Butler’s glove'),
    ledger: card('ledger', 'Debt ledger'),
    receipt: card('receipt', 'Market receipt'),
    mud: card('mud', 'Muddy boots'),
    tMaid: card('tMaid', 'Maid: saw the butler outside', 'testimony'),
    tCook: card('tCook', 'Cook: butler has the safe key', 'testimony'),
  },
  locations: [
    {
      id: 'hall',
      name: 'Hall',
      hotspots: [
        { id: 'coatStand', label: 'Coat stand', gives: ['glove'] },
        { id: 'desk', label: 'Desk', requires: { evidence: ['glove'] }, gives: ['ledger'] },
        { id: 'clock', label: 'Clock', note: 'It is ten minutes slow.' },
      ],
    },
    {
      id: 'pantry',
      name: 'Pantry',
      requires: { interviewed: ['maid'] },
      hotspots: [
        { id: 'shelf', label: 'Shelf', gives: ['receipt'] },
        { id: 'backDoor', label: 'Back door', gives: ['mud'] },
      ],
    },
    {
      id: 'cellar',
      name: 'Cellar',
      requires: { anyOf: [{ evidence: ['ledger'] }, { contradictions: ['cButler'] }] },
      hotspots: [{ id: 'barrel', label: 'Barrel', note: 'Empty.' }],
    },
  ],
  suspects: [
    {
      id: 'butler',
      name: 'The Butler',
      defaultWrongResponse: 'I fail to see the relevance.',
      statements: [
        {
          id: 'alibi',
          text: 'I never left the hall.',
          contradiction: {
            id: 'cButler',
            accepts: ['mud', 'tMaid'],
            response: ['Very well, I stepped outside.'],
          },
        },
      ],
      topics: [{ id: 'brooch', label: 'The brooch', lines: ['A fine piece.'] }],
    },
    {
      id: 'maid',
      name: 'The Maid',
      defaultWrongResponse: 'I don’t understand, sir.',
      statements: [
        {
          id: 'alibi',
          text: 'I was in the pantry all evening.',
          wrongResponse: 'That has nothing to do with me!',
          contradiction: {
            id: 'cMaid',
            accepts: ['receipt'],
            response: ['I went to market. I saw the butler outside.'],
            gives: ['tMaid'],
          },
        },
      ],
      topics: [{ id: 'evening', label: 'The evening', lines: ['Quiet.'] }],
    },
    {
      id: 'cook',
      name: 'The Cook',
      defaultWrongResponse: 'Eh?',
      statements: [{ id: 'alibi', text: 'I was in the kitchen.' }],
      topics: [
        { id: 'kitchen', label: 'The kitchen', lines: ['Busy night.'] },
        {
          id: 'shopping',
          label: 'The shopping',
          requires: { evidence: ['receipt'] },
          lines: ['The butler keeps the safe key.'],
          gives: ['tCook'],
        },
      ],
    },
  ],
  accusation: {
    culpritId: 'butler',
    slots: {
      motive: {
        accepts: ['ledger'],
        failMessage: 'Why would he do it?',
        nearMisses: { note: 'The note says what happened, not why.' },
      },
      means: { accepts: ['glove', 'tCook'], failMessage: 'How did he open the safe?' },
      opportunity: { accepts: ['tMaid'], failMessage: 'When could he have done it?' },
      physical: { accepts: ['mud'], failMessage: 'Nothing physical ties him to it.' },
    },
    rebuttals: {
      maid: 'The maid was at market.',
      cook: 'The cook never left the kitchen.',
    },
    readyWhen: { evidence: ['ledger', 'tMaid', 'mud'] },
  },
  hints: [
    { id: 'desk', doneWhen: { evidence: ['ledger'] }, tiers: ['Check the hall.', 'Examine the desk.'] },
    {
      id: 'maid',
      requires: { interviewed: ['maid'] },
      doneWhen: { contradictions: ['cMaid'] },
      tiers: ['The maid is hiding something.'],
    },
  ],
  story: {
    intro: ['A brooch is missing.'],
    readyLine: 'We have enough.',
    confrontation: {
      motive: ['He owed money.'],
      means: ['He had the glove.'],
      opportunity: ['He was outside.'],
      physical: ['His boots were muddy.'],
    },
    epilogue: ['The brooch was found.'],
  },
};
