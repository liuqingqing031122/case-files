import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import { SLOT_IDS } from '../engine';
import { RATING_CRITERIA, RATING_LABELS, SLOT_LABELS } from '../game/feedback';
import { useGame } from '../game/GameContext';
import './EndingScreen.css';

export default function EndingScreen() {
  const { data, state, go, startNewGame } = useGame();
  const [confirming, setConfirming] = useState(false);
  const outcome = state.outcome;
  if (!outcome) return null;
  const { stats } = outcome;
  const culprit = data.suspects.find((s) => s.id === data.accusation.culpritId);

  return (
    <main className="page ending">
      <p className="page-kicker">Friday, 14 October 1932 · ten o'clock</p>
      <h1 className="page-title">The case against {culprit?.name}</h1>

      <section className="ending-sheet">
        <h2 className="ending-heading">The confrontation</h2>
        {SLOT_IDS.map((slot) => (
          <div key={slot} className="ending-beat">
            <p className="ending-beat-label">{SLOT_LABELS[slot].title}</p>
            {data.story.confrontation[slot].map((line) => (
              <p key={line} className="ending-line">
                {line}
              </p>
            ))}
          </div>
        ))}
      </section>

      <section className="ending-sheet">
        <h2 className="ending-heading">What really happened</h2>
        {data.story.epilogue.map((para) => (
          <p key={para} className="ending-para">
            {para}
          </p>
        ))}
      </section>

      <section className="ending-result" aria-label="Your result">
        <div className="rating-slip">
          <p className="rating-slip-label">Mr. Brandt's verdict</p>
          <div className="rating-stamp">{RATING_LABELS[outcome.rating]}</div>
        </div>
        <p className="rating-criteria">{RATING_CRITERIA}</p>
        <dl className="ending-stats">
          <div>
            <dt>Contradictions found</dt>
            <dd>
              {stats.contradictionsFound}/{stats.contradictionsTotal}
            </dd>
          </div>
          <div>
            <dt>Secrets uncovered</dt>
            <dd>
              {stats.secretsUncovered}/{stats.secretsTotal}
            </dd>
          </div>
          <div>
            <dt>Credibility</dt>
            <dd>
              {state.credibility}/{data.startingCredibility}
            </dd>
          </div>
          <div>
            <dt>Failed accusations</dt>
            <dd>{state.failedAccusations}</dd>
          </div>
        </dl>
        <button className="btn btn-primary" onClick={() => setConfirming(true)}>
          Play again
        </button>
        <button className="btn btn-ghost" onClick={() => go({ name: 'title' })}>
          Back to title
        </button>
      </section>

      {confirming && (
        <ConfirmDialog
          title="Play again?"
          message="Your completed investigation will be replaced, and the case will start again from the beginning."
          cancelLabel="Keep my result"
          confirmLabel="Start a new investigation"
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            startNewGame();
          }}
        />
      )}
    </main>
  );
}
