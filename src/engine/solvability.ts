// Reachability analysis for case data.
//
// Every Condition only asks for things the player *has* (cards, examined
// hotspots, interviews, broken contradictions), and nothing is ever taken
// away. Unlocks are therefore monotone: doing more can never close a door.
// So repeatedly taking every available action until nothing changes reaches
// exactly the set of everything a player can ever obtain.
import { availableTopics, openLocations, visibleHotspots } from './selectors';
import { initialState, reduce } from './state';
import type { CaseData, GameAction, GameState } from './types';

const progressKey = (s: GameState) =>
  [s.evidence, s.examined, s.interviewed, s.topicsHeard, s.contradictions].map((l) => l.length).join('|');

/** Everything reachable from the start of the case, with no wrong moves. */
export function exploreAll(data: CaseData): GameState {
  let state = initialState(data);
  let before = '';
  while (before !== progressKey(state)) {
    before = progressKey(state);
    for (const action of availableActions(data, state)) state = reduce(data, state, action);
  }
  return state;
}

/** Every useful action currently open to the player. */
function availableActions(data: CaseData, state: GameState): GameAction[] {
  const actions: GameAction[] = [];
  for (const location of openLocations(data, state)) {
    for (const h of visibleHotspots(location, state)) {
      actions.push({ type: 'examine', locationId: location.id, hotspotId: h.id });
    }
  }
  for (const suspect of data.suspects) {
    for (const topic of availableTopics(suspect, state)) {
      actions.push({ type: 'askTopic', suspectId: suspect.id, topicId: topic.id });
    }
    for (const statement of suspect.statements) {
      const c = statement.contradiction;
      if (!c || state.contradictions.includes(c.id)) continue;
      const card = c.accepts.find((id) => state.evidence.includes(id));
      if (card) actions.push({ type: 'press', suspectId: suspect.id, statementId: statement.id, evidenceId: card });
    }
  }
  return actions;
}
