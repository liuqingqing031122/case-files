import { useState } from 'react';
import EvidenceArt from '../components/EvidenceArt';
import EvidenceCard from '../components/EvidenceCard';
import DetectivesNote from '../components/DetectivesNote';
import { useGame } from '../game/GameContext';
import { useNotes } from '../game/useNotes';
import { EVIDENCE_ART } from '../game/uiContent';
import './CaseFileScreen.css';

export default function CaseFileScreen() {
  const { data, state } = useGame();
  const [filter, setFilter] = useState<'all' | 'item' | 'testimony'>('all');
  const [viewing, setViewing] = useState<string | null>(null);
  const notes = useNotes(['casefile']);
  const focusFirstCard = () => document.querySelector<HTMLElement>('.casefile-card')?.focus();

  const cards = state.evidence.map((id) => data.evidence[id]).filter((c) => filter === 'all' || c.kind === filter);

  return (
    <main className="page">
      <p className="page-kicker">Everything you have gathered</p>
      <h1 className="page-title">Case File</h1>
      <p className="page-intro">Everything you find is kept here, so you never need to memorise a clue.</p>

      {notes.next && (
        <DetectivesNote
          id={notes.next}
          onGotIt={(kb) => {
            notes.dismiss('casefile');
            if (kb) focusFirstCard();
          }}
          onSkip={(kb) => {
            notes.skip();
            if (kb) focusFirstCard();
          }}
        />
      )}

      <div className="casefile-filters" role="group" aria-label="Filter cards">
        {(['all', 'item', 'testimony'] as const).map((f) => (
          <button key={f} className={`chip chip-dark${filter === f ? ' is-active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${state.evidence.length})` : f === 'item' ? 'Exhibits' : 'Testimony'}
          </button>
        ))}
      </div>

      {cards.length === 0 ? (
        <p className="page-intro">Nothing here yet.</p>
      ) : (
        <ul className={`casefile-grid${notes.next === 'casefile' ? ' is-coached' : ''}`}>
          {cards.map((card) => {
            const art = EVIDENCE_ART[card.id];
            return (
              <li key={card.id}>
                <button className={`casefile-card${card.kind === 'testimony' ? ' is-testimony' : ''}`} onClick={() => setViewing(card.id)}>
                  {art ? (
                    <span className="casefile-thumb">
                      <EvidenceArt kind={art} label="" />
                    </span>
                  ) : (
                    <span className="casefile-quote">“{card.description[0].replace(/^'|'$/g, '')}”</span>
                  )}
                  <span className="casefile-id">{card.id}</span>
                  <span className="casefile-name">{card.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {viewing && <EvidenceCard evidence={data.evidence[viewing]} isNew={false} onClose={() => setViewing(null)} />}
    </main>
  );
}
