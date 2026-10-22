import { useEffect, useRef } from 'react';
import type { SampleEvidence } from '../prototype/sampleData';
import './EvidenceCard.css';

interface Props {
  evidence: SampleEvidence;
  /** True the first time the card is opened, to show the "filed" stamp. */
  isNew: boolean;
  onClose: () => void;
}

export default function EvidenceCard({ evidence, isNew, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="evidence-backdrop" onClick={onClose}>
      <div
        className="evidence-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-name"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="evidence-photo">
          <BottleIllustration />
          <span className="evidence-photo-caption">Exhibit {evidence.id}</span>
        </div>

        <div className="evidence-details">
          <p className="evidence-location">{evidence.location}</p>
          <h2 id="evidence-name" className="evidence-name">
            {evidence.name}
          </h2>

          {evidence.description.map((para) => (
            <p key={para} className="evidence-text">
              {para}
            </p>
          ))}

          {evidence.label && (
            <figure className="chemist-label">
              <figcaption>{evidence.label.heading}</figcaption>
              {evidence.label.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </figure>
          )}

          <div className="evidence-actions">
            <button ref={closeRef} className="btn btn-ink" onClick={onClose}>
              Return to the room
            </button>
          </div>
        </div>

        {isNew && (
          <div className="filed-stamp" aria-live="polite">
            Added to case file
          </div>
        )}
      </div>
    </div>
  );
}

function BottleIllustration() {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="A small empty brown medicine bottle">
      <defs>
        <radialGradient id="photo-light" cx="45%" cy="40%" r="70%">
          <stop offset="0" stopColor="#6d6458" />
          <stop offset="1" stopColor="#2b2722" />
        </radialGradient>
        <linearGradient id="glass" x1="0" x2="1">
          <stop offset="0" stopColor="#4a2a14" />
          <stop offset="0.35" stopColor="#7a4a24" />
          <stop offset="0.5" stopColor="#9a6438" />
          <stop offset="1" stopColor="#3a200f" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#photo-light)" />
      {/* soil and fern fronds */}
      <ellipse cx="100" cy="178" rx="92" ry="20" fill="#2a1d14" />
      <path d="M10 150 q30 -30 60 -10 M190 140 q-35 -35 -70 -8" stroke="#3f5a35" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* bottle, lying slightly tilted */}
      <g transform="rotate(-14 100 110)">
        <rect x="88" y="52" width="24" height="16" rx="3" fill="#c8b48a" />
        <rect x="92" y="66" width="16" height="12" fill="url(#glass)" />
        <path d="M74 84 q0 -8 12 -8 h28 q12 0 12 8 v74 q0 8 -8 8 h-36 q-8 0 -8 -8 z" fill="url(#glass)" />
        <rect x="80" y="104" width="40" height="34" fill="#e9dfc7" opacity="0.92" />
        <line x1="84" y1="112" x2="116" y2="112" stroke="#6a5c4c" strokeWidth="2" />
        <line x1="84" y1="120" x2="110" y2="120" stroke="#6a5c4c" strokeWidth="2" />
        <line x1="84" y1="128" x2="114" y2="128" stroke="#6a5c4c" strokeWidth="2" />
        {/* dried dribble */}
        <path d="M120 86 q4 18 0 34 q-2 10 2 22" stroke="#b7b14a" strokeWidth="3" fill="none" opacity="0.8" strokeLinecap="round" />
        <rect x="80" y="84" width="6" height="70" fill="#fff" opacity="0.08" />
      </g>
    </svg>
  );
}
