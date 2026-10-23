import { useState } from 'react';
import type { EvidenceDef } from '../engine';
import { useModal } from './useModal';
import './EvidenceCard.css';
import './EvidencePicker.css';

interface Props {
  title: string;
  /** The statement or question the card is being chosen for. */
  prompt: string;
  cards: EvidenceDef[];
  confirmLabel: string;
  initial?: string;
  onPick: (evidenceId: string) => void;
  onClose: () => void;
}

export default function EvidencePicker({ title, prompt, cards, confirmLabel, initial, onPick, onClose }: Props) {
  const [selected, setSelected] = useState<string | undefined>(initial);
  const [filter, setFilter] = useState<'all' | 'item' | 'testimony'>('all');
  const shown = cards.filter((c) => filter === 'all' || c.kind === filter);

  const dialogRef = useModal<HTMLDivElement>(onClose);

  return (
    <div className="evidence-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="picker-header">
          <h2 id="picker-title" className="picker-title">
            {title}
          </h2>
          <p className="picker-prompt">{prompt}</p>
          <div className="picker-filters" role="group" aria-label="Filter cards">
            {(['all', 'item', 'testimony'] as const).map((f) => (
              <button key={f} className={`chip${filter === f ? ' is-active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'item' ? 'Exhibits' : 'Testimony'}
              </button>
            ))}
          </div>
        </header>

        <ul className="picker-grid">
          {shown.map((card) => (
            <li key={card.id}>
              <button
                className={`picker-card${selected === card.id ? ' is-selected' : ''}${card.kind === 'testimony' ? ' is-testimony' : ''}`}
                onClick={() => setSelected(card.id)}
                aria-pressed={selected === card.id}
              >
                <span className="picker-card-id">{card.id}</span>
                <span className="picker-card-name">{card.name}</span>
                <span className="picker-card-text">{card.description[0]}</span>
              </button>
            </li>
          ))}
        </ul>

        <footer className="picker-actions">
          <button className="btn btn-ghost-ink" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={!selected} onClick={() => selected && onPick(selected)}>
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}
