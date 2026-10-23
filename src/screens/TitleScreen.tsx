import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import './TitleScreen.css';

export type TitleMode = 'fresh' | 'inProgress' | 'solved';

interface Props {
  mode: TitleMode;
  /** e.g. "Saved today at 14:32". */
  savedLabel?: string;
  /** A stored save existed but could not be read. */
  unreadableSave: boolean;
  onContinue: () => void;
  /** Starts a new game. Confirmation is handled here when progress exists. */
  onNewGame: () => void;
}

const STATUS: Record<TitleMode, string> = { fresh: 'Unsolved', inProgress: 'In progress', solved: 'Solved' };

export default function TitleScreen({ mode, savedLabel, unreadableSave, onContinue, onNewGame }: Props) {
  const [confirming, setConfirming] = useState(false);
  const hasGame = mode !== 'fresh';

  return (
    <main className="title-screen">
      <div className="folder" aria-labelledby="game-title">
        <div className="folder-tab">
          <span>CASE No. 1932/41</span>
        </div>

        <div className="folder-body">
          <PaperClip />

          <p className="folder-kicker">Kent County Constabulary · Consulting File</p>

          <h1 id="game-title" className="folder-title">
            Case Files
          </h1>
          <p className="folder-subtitle">The Ashgrove Manor Affair</p>

          <dl className="folder-meta">
            <div>
              <dt>Deceased</dt>
              <dd>Sir Edmund Ashgrove</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>Thursday, 13 October 1932</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd className={`folder-status is-${mode}`}>{STATUS[mode]}</dd>
            </div>
          </dl>

          <div className="stamp" aria-hidden="true">
            Confidential
          </div>

          <div className="folder-actions">
            {hasGame ? (
              <>
                <button className="btn btn-primary" onClick={onContinue} autoFocus>
                  {mode === 'solved' ? 'View Result' : 'Continue Investigation'}
                </button>
                <button className="btn btn-ghost-ink" onClick={() => setConfirming(true)}>
                  New Game
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={onNewGame} autoFocus>
                Enter the Manor
              </button>
            )}
          </div>

          {hasGame && savedLabel && <p className="folder-saved">{savedLabel}</p>}
          {!hasGame && unreadableSave && (
            <p className="folder-saved is-warning" role="status">
              A previous save couldn't be read and will be replaced.
            </p>
          )}
        </div>
      </div>

      <p className="title-footnote">Progress is saved automatically in this browser.</p>

      {confirming && (
        <ConfirmDialog
          title="Start a new investigation?"
          message={
            mode === 'solved'
              ? 'Your solved case will be cleared and the investigation will start again from the beginning.'
              : 'Your current progress on this case will be lost.'
          }
          cancelLabel="Keep my case"
          confirmLabel="Start over"
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onNewGame();
          }}
        />
      )}
    </main>
  );
}

function PaperClip() {
  return (
    <svg className="paperclip" viewBox="0 0 40 110" aria-hidden="true">
      <path
        d="M14 100 V22 a10 10 0 0 1 20 0 v66 a14 14 0 0 1 -28 0 V30"
        fill="none"
        stroke="#9aa0a6"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
