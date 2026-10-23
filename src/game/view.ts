// Screens the app can show. Kept separate from GameContext so non-React code
// (saving) can use it.
export type View =
  | { name: 'title' }
  | { name: 'intro' }
  | { name: 'rooms' }
  | { name: 'location'; id: string }
  | { name: 'suspects' }
  | { name: 'interview'; id: string }
  | { name: 'casefile' }
  | { name: 'accuse' }
  | { name: 'ending' };

/** Investigation screens a saved game can resume on. */
export type ResumeView = Extract<
  View,
  { name: 'rooms' | 'location' | 'suspects' | 'interview' | 'casefile' | 'accuse' }
>;

export const isResumeView = (view: View): view is ResumeView =>
  ['rooms', 'location', 'suspects', 'interview', 'casefile', 'accuse'].includes(view.name);
