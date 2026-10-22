// TEMPORARY prototype content for Milestone 1.
// Replaced in M2/M3 by the typed case engine and src/case/ashgrove.ts.

export interface SampleEvidence {
  id: string;
  name: string;
  location: string;
  description: string[];
  label?: { heading: string; lines: string[] };
}

export interface SampleHotspot {
  id: string;
  label: string;
  /** Position over the scene, as percentages of its width/height. */
  x: number;
  y: number;
  /** Either reveals an evidence card, or shows a short observation. */
  evidenceId?: string;
  note?: string;
}

export const evidence: Record<string, SampleEvidence> = {
  E6: {
    id: 'E6',
    name: 'Empty Tincture Bottle',
    location: 'Dining Room · fern planter on the sideboard',
    description: [
      'A small brown medicine bottle, pushed down among the fern roots where no one would look.',
      'It is empty. A dried, yellow-green dribble runs down one side, as if it were poured in a hurry.',
    ],
    label: {
      heading: "HARTLEY'S CHEMIST — WESTERHAM",
      lines: ['Tinct. Digitalis', 'Lady V. Ashgrove', 'Collected in person, 11 Oct.'],
    },
  },
};

export const diningRoomHotspots: SampleHotspot[] = [
  {
    id: 'fern',
    label: 'Fern planter',
    x: 84,
    y: 38,
    evidenceId: 'E6',
  },
  {
    id: 'glass',
    label: "Sir Edmund's place",
    x: 30,
    y: 66,
    note: 'Dr. Harlow has set aside the tonic glass under a cloth. A faint bitter smell lingers. (Full examination arrives in a later version.)',
  },
  {
    id: 'window',
    label: 'Window',
    x: 11,
    y: 32,
    note: "Last night's rain has left the panes streaked. Inspector Gale's notes say it had been dry all week until half past seven.",
  },
];
