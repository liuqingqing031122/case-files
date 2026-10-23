// The game reducer: every player action goes through `reduce`, which returns
// a new state and never mutates the old one. Invalid actions (locked content,
// cards the player doesn't hold) leave progress untouched and report
// `rejected`, so a buggy UI can't corrupt a playthrough.
import { evaluateAccusation } from './accusation';
import {
  findHotspot,
  findLocation,
  findStatement,
  findSuspect,
  findTopic,
  hasEvidence,
  isMet,
  topicKey,
} from './selectors';
import { SLOT_IDS, type CaseData, type GameAction, type GameState } from './types';

export function initialState(data: CaseData): GameState {
  return {
    caseId: data.id,
    evidence: [...data.startingEvidence],
    examined: [],
    interviewed: [],
    topicsHeard: [],
    contradictions: [],
    credibility: data.startingCredibility,
    wrongPresentations: 0,
    failedAccusations: 0,
    outcome: null,
    lastEvent: { kind: 'none' },
  };
}

const addUnique = (list: string[], ids: string[]) => [
  ...list,
  ...ids.filter((id, i) => !list.includes(id) && ids.indexOf(id) === i),
];

/** Adds cards and reports which ones were actually new. */
function gain(state: GameState, ids: string[] = []) {
  const evidence = addUnique(state.evidence, ids);
  return { evidence, gained: evidence.slice(state.evidence.length) };
}

const reject = (state: GameState, reason: string): GameState => ({
  ...state,
  lastEvent: { kind: 'rejected', reason },
});

const penalise = (credibility: number) => Math.max(0, credibility - 1);

export function reduce(data: CaseData, state: GameState, action: GameAction): GameState {
  if (action.type === 'reset') return initialState(data);
  if (state.outcome) return reject(state, 'The case is closed.');

  switch (action.type) {
    case 'examine': {
      const location = findLocation(data, action.locationId);
      if (!location || !isMet(location.requires, state)) return reject(state, 'Location is not open.');
      const hotspot = findHotspot(location, action.hotspotId);
      if (!hotspot || !isMet(hotspot.requires, state)) return reject(state, 'Nothing to examine there.');

      const { evidence, gained } = gain(state, hotspot.gives);
      return {
        ...state,
        evidence,
        examined: addUnique(state.examined, [hotspot.id]),
        lastEvent: { kind: 'examined', hotspotId: hotspot.id, gained, note: hotspot.note },
      };
    }

    case 'askTopic': {
      const suspect = findSuspect(data, action.suspectId);
      if (!suspect) return reject(state, 'Unknown suspect.');
      const topic = findTopic(suspect, action.topicId);
      if (!topic || !isMet(topic.requires, state)) return reject(state, 'That topic is not available.');

      const { evidence, gained } = gain(state, topic.gives);
      return {
        ...state,
        evidence,
        interviewed: addUnique(state.interviewed, [suspect.id]),
        topicsHeard: addUnique(state.topicsHeard, [topicKey(suspect.id, topic.id)]),
        lastEvent: { kind: 'topic', suspectId: suspect.id, topicId: topic.id, lines: topic.lines, gained },
      };
    }

    case 'press': {
      const suspect = findSuspect(data, action.suspectId);
      if (!suspect) return reject(state, 'Unknown suspect.');
      const statement = findStatement(suspect, action.statementId);
      if (!statement) return reject(state, 'Unknown statement.');
      if (!hasEvidence(state, action.evidenceId)) return reject(state, 'You do not hold that card.');

      // Any genuine attempt to press counts as interviewing the suspect.
      state = { ...state, interviewed: addUnique(state.interviewed, [suspect.id]) };

      const contradiction = statement.contradiction;
      if (contradiction && state.contradictions.includes(contradiction.id)) {
        return { ...state, lastEvent: { kind: 'alreadyBroken', contradictionId: contradiction.id } };
      }

      if (contradiction && contradiction.accepts.includes(action.evidenceId)) {
        const { evidence, gained } = gain(state, contradiction.gives);
        return {
          ...state,
          evidence,
          contradictions: [...state.contradictions, contradiction.id],
          lastEvent: {
            kind: 'contradiction',
            contradictionId: contradiction.id,
            response: contradiction.response,
            gained,
          },
        };
      }

      // Soft penalty only: nothing is ever locked out.
      const credibility = penalise(state.credibility);
      return {
        ...state,
        credibility,
        wrongPresentations: state.wrongPresentations + 1,
        lastEvent: {
          kind: 'wrongPress',
          suspectId: suspect.id,
          response: statement.wrongResponse ?? suspect.defaultWrongResponse,
          credibility,
        },
      };
    }

    case 'accuse': {
      const { accusation } = action;
      if (!findSuspect(data, accusation.suspectId)) return reject(state, 'Unknown suspect.');
      const unheld = SLOT_IDS.map((slot) => accusation.slots[slot]).filter(
        (card): card is string => !!card && !hasEvidence(state, card),
      );
      if (unheld.length > 0) return reject(state, 'You do not hold every card you submitted.');

      const result = evaluateAccusation(data, state, accusation);
      if (result.kind === 'proven') {
        return { ...state, outcome: result, lastEvent: { kind: 'accusation', result } };
      }
      // Wrong culprit or insufficient proof: the case reopens.
      return {
        ...state,
        credibility: penalise(state.credibility),
        failedAccusations: state.failedAccusations + 1,
        lastEvent: { kind: 'accusation', result },
      };
    }
  }
}
