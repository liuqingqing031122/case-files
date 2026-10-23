// Connects the engine to React. Holds the game state (engine), plus UI-only
// state: the current view, toasts and hint tiers. Nothing is saved yet (M5).
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  initialState,
  isReadyToAccuse,
  openLocations,
  reduce,
  type CaseData,
  type GameAction,
  type GameState,
} from '../engine';

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

export interface Toast {
  id: number;
  text: string;
  tone: 'info' | 'good' | 'bad';
}

interface GameApi {
  data: CaseData;
  state: GameState;
  /** Applies an action and returns the new state, so callers can read lastEvent immediately. */
  act: (action: GameAction) => GameState;
  view: View;
  go: (view: View) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  /** How many tiers of each hint have been revealed. */
  hintTiers: Record<string, number>;
  revealHintTier: (hintId: string) => void;
  /** Whether the player has opened Gale's hints yet (drives a gentle highlight). */
  galeOpened: boolean;
  markGaleOpened: () => void;
  newGame: () => void;
}

const GameContext = createContext<GameApi | null>(null);

export function GameProvider({ data, children }: { data: CaseData; children: ReactNode }) {
  const [state, setState] = useState(() => initialState(data));
  const stateRef = useRef(state);
  const [view, setView] = useState<View>({ name: 'title' });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hintTiers, setHintTiers] = useState<Record<string, number>>({});
  const [galeOpened, setGaleOpened] = useState(false);
  const nextToastId = useRef(1);

  const notify = useCallback((text: string, tone: Toast['tone'] = 'info') => {
    const id = nextToastId.current++;
    setToasts((prev) => [...prev, { id, text, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const act = useCallback(
    (action: GameAction) => {
      const prev = stateRef.current;
      const next = reduce(data, prev, action);
      if (next === prev) return prev;
      stateRef.current = next;
      setState(next);

      // Announce side effects the player might otherwise miss.
      const before = new Set(openLocations(data, prev).map((l) => l.id));
      for (const loc of openLocations(data, next)) {
        if (!before.has(loc.id)) notify(`New location unlocked: ${loc.name}`, 'good');
      }
      if (!isReadyToAccuse(data, prev) && isReadyToAccuse(data, next)) {
        notify(`Inspector Gale: “${data.story.readyLine}”`, 'good');
      }
      return next;
    },
    [data, notify],
  );

  const newGame = useCallback(() => {
    const fresh = initialState(data);
    stateRef.current = fresh;
    setState(fresh);
    setHintTiers({});
    setGaleOpened(false);
    setToasts([]);
  }, [data]);

  const api = useMemo<GameApi>(
    () => ({
      data,
      state,
      act,
      view,
      go: (v) => {
        setView(v);
        window.scrollTo({ top: 0 });
      },
      toasts,
      dismissToast: (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
      hintTiers,
      revealHintTier: (hintId) =>
        setHintTiers((prev) => ({ ...prev, [hintId]: (prev[hintId] ?? 1) + 1 })),
      galeOpened,
      markGaleOpened: () => setGaleOpened(true),
      newGame,
    }),
    [data, state, act, view, toasts, hintTiers, galeOpened, newGame],
  );

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

export function useGame(): GameApi {
  const api = useContext(GameContext);
  if (!api) throw new Error('useGame must be used inside <GameProvider>');
  return api;
}
