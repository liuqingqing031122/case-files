// Connects the engine to React. Holds the game state (engine), plus UI-only
// state: the current view, toasts and hint tiers. Saving is delegated to the
// save controller (save.ts), which reads the stored game once at start-up and
// only autosaves after the player explicitly continues or starts a new game.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  initialState,
  isReadyToAccuse,
  openLocations,
  reduce,
  type CaseData,
  type GameAction,
  type GameState,
} from '../engine';
import { newlyRevealedHotspots, revealMessage } from './announcements';
import { createSaveController, getStorage, hasProgress, resumeView, type SaveController, type SaveInfo } from './save';
import { isResumeView, type ResumeView, type View } from './view';

export type { View } from './view';

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
  /** What the title screen should offer. */
  saveInfo: SaveInfo;
  /** True when a game can be continued (this session's, or a stored one). */
  canContinue: boolean;
  /** Whether the continuable game is already solved. */
  continueSolved: boolean;
  continueGame: () => void;
  /** Clears any saved game, resets progress and opens the intro. */
  startNewGame: () => void;
}

const GameContext = createContext<GameApi | null>(null);

interface ProviderProps {
  data: CaseData;
  children: ReactNode;
  /** Injectable for tests; defaults to the browser's localStorage. */
  storage?: Storage | null;
}

export function GameProvider({ data, children, storage }: ProviderProps) {
  // Created (and the stored save read and validated) before the first render.
  const controllerRef = useRef<SaveController | null>(null);
  if (!controllerRef.current) {
    controllerRef.current = createSaveController(data, storage === undefined ? getStorage() : storage);
  }
  const controller = controllerRef.current;

  const [state, setState] = useState(() => initialState(data));
  const stateRef = useRef(state);
  const [view, setView] = useState<View>({ name: 'title' });
  const [lastView, setLastView] = useState<ResumeView>({ name: 'rooms' });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hintTiers, setHintTiers] = useState<Record<string, number>>({});
  const [galeOpened, setGaleOpened] = useState(false);
  const [saveInfo, setSaveInfo] = useState<SaveInfo>(() => controller.info());
  const [active, setActive] = useState(false);
  const nextToastId = useRef(1);
  const warnedNoSave = useRef(false);

  const notify = useCallback((text: string, tone: Toast['tone'] = 'info') => {
    const id = nextToastId.current++;
    setToasts((prev) => [...prev, { id, text, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const go = useCallback((v: View) => {
    setView(v);
    if (isResumeView(v)) setLastView(v);
    window.scrollTo({ top: 0 });
  }, []);

  // Autosave. The controller ignores this until a session is active, so the
  // blank start-up state can never overwrite a stored game.
  useEffect(() => {
    const result = controller.autosave(state, { hintTiers, galeOpened, view: lastView });
    if (result === 'written') {
      setSaveInfo(controller.info());
    } else if (result === 'failed' && !warnedNoSave.current) {
      warnedNoSave.current = true;
      notify("Progress can't be saved in this browser.", 'bad');
    }
  }, [controller, state, hintTiers, galeOpened, lastView, notify]);

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
      for (const revealed of newlyRevealedHotspots(data, prev, next)) notify(revealMessage(revealed), 'good');
      if (!isReadyToAccuse(data, prev) && isReadyToAccuse(data, next)) {
        notify(`Inspector Gale: “${data.story.readyLine}”`, 'good');
      }
      return next;
    },
    [data, notify],
  );

  const continueGame = useCallback(() => {
    const loaded = controller.continueGame();
    setActive(controller.isActive());
    if (loaded) {
      // Restoring from storage (e.g. after a refresh).
      stateRef.current = loaded.state;
      setState(loaded.state);
      setHintTiers(loaded.ui.hintTiers);
      setGaleOpened(loaded.ui.galeOpened);
      setLastView(loaded.ui.view);
      setSaveInfo(controller.info());
      go(resumeView(data, loaded.state, loaded.ui.view));
    } else if (controller.isActive()) {
      // Same session: the in-memory game is current.
      go(resumeView(data, stateRef.current, lastView));
    } else {
      // The stored save vanished or broke since start-up.
      setSaveInfo(controller.info());
    }
  }, [controller, data, go, lastView]);

  const startNewGame = useCallback(() => {
    controller.startNewGame();
    const fresh = initialState(data);
    stateRef.current = fresh;
    setState(fresh);
    setHintTiers({});
    setGaleOpened(false);
    setLastView({ name: 'rooms' });
    setToasts([]);
    setSaveInfo(controller.info());
    setActive(true);
    go({ name: 'intro' });
  }, [controller, data, go]);

  const sessionHasGame = active && hasProgress(state);
  const canContinue = sessionHasGame || (!active && saveInfo.status === 'valid');
  const continueSolved = sessionHasGame ? state.outcome !== null : saveInfo.solved;

  const api = useMemo<GameApi>(
    () => ({
      data,
      state,
      act,
      view,
      go,
      toasts,
      dismissToast: (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
      hintTiers,
      revealHintTier: (hintId) =>
        setHintTiers((prev) => ({ ...prev, [hintId]: (prev[hintId] ?? 1) + 1 })),
      galeOpened,
      markGaleOpened: () => setGaleOpened(true),
      saveInfo,
      canContinue,
      continueSolved,
      continueGame,
      startNewGame,
    }),
    [data, state, act, view, go, toasts, hintTiers, galeOpened, saveInfo, canContinue, continueSolved, continueGame, startNewGame],
  );

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

export function useGame(): GameApi {
  const api = useContext(GameContext);
  if (!api) throw new Error('useGame must be used inside <GameProvider>');
  return api;
}
