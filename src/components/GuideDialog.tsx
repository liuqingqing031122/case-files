import { useEffect, useRef, useState } from 'react';
import { useGame } from '../game/GameContext';
import { GUIDE_SECTIONS, GUIDE_TITLE } from '../game/guide';
import { useModal } from './useModal';
import './EvidenceCard.css';
import './GuideDialog.css';

/** The optional "How to Play" guide, shown over whatever screen is open. */
export default function GuideDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useModal<HTMLDivElement>(onClose);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showTipsAgain } = useGame();
  const [tipsRestored, setTipsRestored] = useState(false);

  // Always start at the top, however far it was scrolled last time.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  return (
    <div className="evidence-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="guide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="evidence-x" onClick={onClose} aria-label="Close guide">
          ×
        </button>

        {/* Focusable so keyboard users can scroll the guide with the arrow keys. */}
        <div ref={scrollRef} className="guide-scroll" tabIndex={0} aria-labelledby="guide-title">
          <p className="guide-kicker">How to Play</p>
          <h2 id="guide-title" className="guide-title">
            {GUIDE_TITLE}
          </h2>

          {GUIDE_SECTIONS.map((section) => (
            <section key={section.heading} className="guide-section">
              <h3 className="guide-heading">{section.heading}</h3>
              {section.paragraphs?.map((p) => (
                <p key={p} className="guide-text">
                  {p}
                </p>
              ))}
              {section.points && (
                <ul className="guide-points">
                  {section.points.map((point) => (
                    <li key={point.text}>
                      {point.lead && <strong>{point.lead}{point.colon ? ':' : ''}</strong>}
                      {point.lead && ' '}
                      {point.text}
                    </li>
                  ))}
                </ul>
              )}
              {section.note && (
                <p className="guide-note">
                  <strong>{section.note.label}.</strong> {section.note.text}
                </p>
              )}
            </section>
          ))}

          <section className="guide-section guide-tips">
            <h3 className="guide-heading">Detective's Notes</h3>
            <p className="guide-text">
              Short notes appear the first time you open each part of the game. You can bring them back at any time.
            </p>
            <button
              className="btn btn-ghost-ink"
              onClick={() => {
                showTipsAgain();
                setTipsRestored(true);
              }}
            >
              Show tips again
            </button>
            <p className="guide-tips-status" role="status">
              {tipsRestored ? 'Tips are back on. They will appear as you next visit each area.' : ''}
            </p>
          </section>
        </div>

        <div className="evidence-actions">
          <button className="btn btn-ink" onClick={onClose}>
            Close guide
          </button>
        </div>
      </div>
    </div>
  );
}
