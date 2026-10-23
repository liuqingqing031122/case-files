import { useEffect, useRef } from 'react';
import type { EvidenceDef } from '../engine';
import { EVIDENCE_ART } from '../game/uiContent';
import EvidenceArt from './EvidenceArt';
import { useModal } from './useModal';
import './EvidenceCard.css';

interface Props {
  evidence: EvidenceDef;
  /** True the first time the card is opened, to show the "filed" stamp. */
  isNew: boolean;
  onClose: () => void;
  closeLabel?: string;
}

export default function EvidenceCard({ evidence, isNew, onClose, closeLabel = 'Close' }: Props) {
  const dialogRef = useModal<HTMLDivElement>(onClose);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isTestimony = evidence.kind === 'testimony';
  const art = EVIDENCE_ART[evidence.id];

  // When "Next" moves to another card, start it from the top too.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [evidence.id]);

  return (
    <div className="evidence-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`evidence-card${isTestimony || !art ? ' is-text-only' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-name"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="evidence-x" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div ref={scrollRef} className="evidence-scroll">
          {!isTestimony && art && (
            <div className="evidence-photo">
              <EvidenceArt kind={art} label={evidence.name} />
              <span className="evidence-photo-caption">Exhibit {evidence.id}</span>
            </div>
          )}

          <div className="evidence-details">
            <p className="evidence-location">
              {isTestimony ? `Testimony ${evidence.id}` : `Exhibit ${evidence.id}`}
            </p>
            <h2 id="evidence-name" className="evidence-name">
              {evidence.name}
            </h2>

            {evidence.description.map((para) => (
              <p key={para} className={isTestimony ? 'evidence-quote' : 'evidence-text'}>
                {para}
              </p>
            ))}
          </div>

          {isNew && (
            <div className="filed-stamp" aria-live="polite">
              Added to case file
            </div>
          )}
        </div>

        <div className="evidence-actions">
          <button className="btn btn-ink" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
