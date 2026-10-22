// Shared helpers for engine tests.
import { miniCase } from './__fixtures__/miniCase';
import { initialState, reduce } from './state';
import type { CaseData, GameAction, GameState } from './types';

export function play(actions: GameAction[], data: CaseData = miniCase, from?: GameState): GameState {
  return actions.reduce((state, action) => reduce(data, state, action), from ?? initialState(data));
}

/** Actions that collect every card needed to prove the mini case. */
export const fullInvestigation: GameAction[] = [
  { type: 'examine', locationId: 'hall', hotspotId: 'coatStand' },
  { type: 'examine', locationId: 'hall', hotspotId: 'desk' },
  { type: 'openInterview', suspectId: 'maid' },
  { type: 'examine', locationId: 'pantry', hotspotId: 'shelf' },
  { type: 'examine', locationId: 'pantry', hotspotId: 'backDoor' },
  { type: 'press', suspectId: 'maid', statementId: 'alibi', evidenceId: 'receipt' },
];

export const winningAccusation: GameAction = {
  type: 'accuse',
  accusation: {
    suspectId: 'butler',
    slots: { motive: 'ledger', means: 'glove', opportunity: 'tMaid', physical: 'mud' },
  },
};
