// Presentation-only details for Ashgrove Manor that don't belong in the
// engine's case data: hotspot positions on the scene art, room blurbs,
// suspect roles and evidence illustrations.

export const ROOM_INFO: Record<string, { blurb: string; lockedHint?: string }> = {
  dining: { blurb: 'Where Sir Edmund collapsed. Locked by Dr. Harlow at 9.50.' },
  study: { blurb: "Sir Edmund's desk, his papers, his telephone. Also locked overnight." },
  servants: {
    blurb: "The pantry, the stove, and the back door to the garden.",
    lockedHint: 'Mrs. Pell runs the Servants’ Hall. Interview her first: ask her about anything.',
  },
  upstairs: {
    blurb: 'The family bedrooms, off a single landing.',
    lockedHint: 'The family must agree to a search. Interview Lady Ashgrove, Julian and Clara first.',
  },
};

/** Hotspot positions as percentages of the scene's width and height. */
export const HOTSPOT_POSITIONS: Record<string, { x: number; y: number }> = {
  // Dining room
  window: { x: 11, y: 32 },
  tonicGlass: { x: 30, y: 66 },
  tonicTray: { x: 20, y: 72 },
  jibDoor: { x: 66, y: 40 },
  fernPlanter: { x: 84, y: 38 },
  // Study
  telephone: { x: 72, y: 47 },
  blotter: { x: 50, y: 53 },
  leftDrawer: { x: 34, y: 67 },
  forcedDrawer: { x: 64, y: 67 },
  draftWill: { x: 73, y: 61 },
  deskFloor: { x: 55, y: 88 },
  // Servants' hall
  householdBook: { x: 16, y: 38 },
  backStep: { x: 50, y: 80 },
  laundryHamper: { x: 83, y: 72 },
  // Upstairs
  claraRoom: { x: 20, y: 48 },
  julianRoom: { x: 50, y: 48 },
  victoriaRoom: { x: 80, y: 48 },
  landing: { x: 50, y: 86 },
};

export const SUSPECT_INFO: Record<string, { role: string; initials: string; tint: string }> = {
  victoria: { role: 'Second wife · former actress', initials: 'VA', tint: '#6b3a4a' },
  julian: { role: 'Son · heir apparent', initials: 'JA', tint: '#3b4a5e' },
  clara: { role: 'Daughter', initials: 'CA', tint: '#4e5a3a' },
  pell: { role: 'Housekeeper of thirty years', initials: 'AP', tint: '#5a4a35' },
  theo: { role: 'Nephew · private secretary', initials: 'TL', tint: '#3e3e48' },
};

export type ArtKind =
  | 'document'
  | 'bottle'
  | 'emptyBottle'
  | 'glass'
  | 'drawer'
  | 'cufflink'
  | 'footprints'
  | 'book'
  | 'shirt'
  | 'plan';

export const EVIDENCE_ART: Record<string, ArtKind> = {
  E1: 'document',
  E2: 'document',
  E3: 'plan',
  E4: 'glass',
  E5: 'bottle',
  E6: 'emptyBottle',
  E7: 'drawer',
  E8: 'document',
  E9: 'drawer',
  E10: 'cufflink',
  E11: 'document',
  E12: 'document',
  E13: 'footprints',
  E14: 'book',
  E15: 'book',
  E16: 'document',
  E17: 'shirt',
  E18: 'document',
};
