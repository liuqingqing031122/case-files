import { useLayoutEffect, useRef, useState } from 'react';
import { isReadyToAccuse, nextHint } from '../engine';
import { useGame, type View } from '../game/GameContext';
import './GameHeader.css';

const TABS: { label: string; view: View; matches: View['name'][] }[] = [
  { label: 'Rooms', view: { name: 'rooms' }, matches: ['rooms', 'location'] },
  { label: 'Suspects', view: { name: 'suspects' }, matches: ['suspects', 'interview'] },
  { label: 'Case File', view: { name: 'casefile' }, matches: ['casefile'] },
  { label: 'Accuse', view: { name: 'accuse' }, matches: ['accuse'] },
];

export default function GameHeader() {
  const { data, state, view, go, galeOpened, markGaleOpened } = useGame();
  const [hintOpen, setHintOpen] = useState(false);
  const ready = isReadyToAccuse(data, state);
  const headerRef = useRef<HTMLElement>(null);

  // Publish the header's height so sticky bars below it (BackLink) sit flush.
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const publish = () => document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header ref={headerRef} className="game-header">
      <div className="game-header-row">
        <button className="game-brand" onClick={() => go({ name: 'title' })} aria-label="Back to title screen">
          <span className="game-brand-kicker">Case Files</span>
          <span className="game-brand-title">Ashgrove Manor</span>
        </button>

        <div className="game-status">
          <Credibility value={state.credibility} max={data.startingCredibility} />
          <button
            className={`gale-button${hintOpen ? ' is-open' : ''}${galeOpened ? '' : ' is-new'}`}
            onClick={() => {
              setHintOpen((o) => !o);
              markGaleOpened();
            }}
            aria-expanded={hintOpen}
            title="Inspector Gale, your partner on the case, can suggest what to do next."
          >
            <span className="gale-button-kicker">Stuck? Hints</span>
            <span className="gale-button-label">Ask Gale</span>
          </button>
        </div>
      </div>

      <nav className="game-nav" aria-label="Investigation">
        {TABS.map((tab) => {
          const active = tab.matches.includes(view.name);
          const isAccuse = tab.view.name === 'accuse';
          return (
            <button
              key={tab.label}
              className={`game-tab${active ? ' is-active' : ''}${isAccuse && ready ? ' is-ready' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => go(tab.view)}
            >
              {tab.view.name === 'casefile' ? (
                <span>
                  <span className="tab-long">Case </span>File
                </span>
              ) : (
                tab.label
              )}
              {tab.view.name === 'casefile' && <span className="game-tab-count">{state.evidence.length}</span>}
              {isAccuse && ready && <span className="ready-dot" aria-label="Ready" />}
            </button>
          );
        })}
      </nav>

      {hintOpen && <HintPanel onClose={() => setHintOpen(false)} />}
    </header>
  );
}

function Credibility({ value, max }: { value: number; max: number }) {
  return (
    <div className="credibility" aria-label={`Credibility ${value} of ${max}`} title="Credibility">
      <span className="credibility-label" aria-hidden="true">
        Credibility
      </span>
      <span className="credibility-pips" aria-hidden="true">
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={`pip${i < value ? ' is-full' : ''}`} />
        ))}
      </span>
    </div>
  );
}

function HintPanel({ onClose }: { onClose: () => void }) {
  const { data, state, hintTiers, revealHintTier } = useGame();
  const hint = nextHint(data, state);
  const tier = hint ? (hintTiers[hint.id] ?? 1) : 0;

  return (
    <aside className="hint-slip" aria-live="polite">
      <p className="hint-from">Inspector Gale · your partner on the case</p>
      <p className="hint-help">Gale gives hints, not answers. Ask for more if you need a clearer one.</p>
      {hint ? (
        <>
          {hint.tiers.slice(0, tier).map((line) => (
            <p key={line} className="hint-line">
              “{line}”
            </p>
          ))}
          {tier < hint.tiers.length && (
            <button className="hint-more" onClick={() => revealHintTier(hint.id)}>
              Ask for more
            </button>
          )}
        </>
      ) : (
        <p className="hint-line">
          “{isReadyToAccuse(data, state) ? data.story.readyLine : 'Nothing springs to mind, Detective. Keep at it.'}”
        </p>
      )}
      <button className="note-close" onClick={onClose} aria-label="Close hint">
        ×
      </button>
    </aside>
  );
}
