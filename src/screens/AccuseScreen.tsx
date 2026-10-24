import { useState } from 'react';
import { SLOT_IDS, isReadyToAccuse, type SlotId } from '../engine';
import ConfirmDialog from '../components/ConfirmDialog';
import EvidencePicker from '../components/EvidencePicker';
import Portrait from '../components/Portrait';
import { ACCUSE_REMINDER, SLOT_LABELS, accusationFeedback, type Feedback } from '../game/feedback';
import DetectivesNote from '../components/DetectivesNote';
import { useGame } from '../game/GameContext';
import { useNotes } from '../game/useNotes';
import './AccuseScreen.css';

export default function AccuseScreen() {
  const { data, state, act, go } = useGame();
  const [suspectId, setSuspectId] = useState<string | null>(null);
  const [slots, setSlots] = useState<Partial<Record<SlotId, string>>>({});
  const [picking, setPicking] = useState<SlotId | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [verdict, setVerdict] = useState<Feedback | null>(null);
  const notes = useNotes(['accuse']);
  const focusFirstSuspect = () => document.querySelector<HTMLElement>('.accuse-suspect')?.focus();

  const held = state.evidence.map((id) => data.evidence[id]);
  const filled = SLOT_IDS.filter((s) => slots[s]).length;
  const suspect = data.suspects.find((s) => s.id === suspectId);

  const submit = () => {
    if (!suspectId) return;
    setConfirming(false);
    const credibilityBefore = state.credibility;
    const next = act({ type: 'accuse', accusation: { suspectId, slots } });
    const event = next.lastEvent;
    if (event.kind !== 'accusation') return;
    if (event.result.kind === 'proven') {
      go({ name: 'ending' });
      return;
    }
    setVerdict(accusationFeedback(event.result, data.startingCredibility, next.credibility, credibilityBefore));
  };

  if (verdict) {
    return (
      <main className="page">
        <p className="page-kicker">Mr. Brandt's Verdict · Accusation {state.failedAccusations}</p>
        <h1 className="page-title">{verdict.heading}</h1>
        <section className="verdict" aria-live="polite">
          {verdict.lines.map((line) => (
            <p key={line} className="verdict-line">
              {line}
            </p>
          ))}
          {verdict.credibilityNote && <p className="exchange-cred">{verdict.credibilityNote}</p>}
          <div className="verdict-actions">
            <button className="btn btn-ghost-ink" onClick={() => setVerdict(null)}>
              Revise the accusation
            </button>
            <button className="btn btn-primary" onClick={() => go({ name: 'rooms' })}>
              Back to the investigation
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <p className="page-kicker">Before Mr. Brandt</p>
      <h1 className="page-title">Make your accusation</h1>
      <p className="page-intro">
        Naming the culprit is not enough. Support each part of the case with one card from your file.
        {isReadyToAccuse(data, state) ? ' Inspector Gale thinks you are ready.' : ''}
      </p>
      <p className="accuse-reminder">{ACCUSE_REMINDER}</p>

      {/* Shown before the player starts choosing, above the suspects. */}
      {notes.next && (
        <DetectivesNote
          id={notes.next}
          onGotIt={(kb) => {
            notes.dismiss('accuse');
            if (kb) focusFirstSuspect();
          }}
          onSkip={(kb) => {
            notes.skip();
            if (kb) focusFirstSuspect();
          }}
        />
      )}

      <section aria-labelledby="accuse-who">
        <h2 id="accuse-who" className="section-heading">
          1 · Who did it?
        </h2>
        <div className="accuse-suspects" role="radiogroup" aria-label="Suspect">
          {data.suspects.map((s) => (
            <button
              key={s.id}
              role="radio"
              aria-checked={suspectId === s.id}
              className={`accuse-suspect${suspectId === s.id ? ' is-selected' : ''}`}
              onClick={() => setSuspectId(s.id)}
            >
              <Portrait suspectId={s.id} size={64} />
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="accuse-proof">
        <h2 id="accuse-proof" className="section-heading">
          2 · Prove it
        </h2>
        <ul className={`accuse-slots${notes.next === 'accuse' ? ' is-coached' : ''}`}>
          {SLOT_IDS.map((slot) => {
            const card = slots[slot] ? data.evidence[slots[slot]!] : undefined;
            return (
              <li key={slot} className="accuse-slot">
                <div>
                  <p className="accuse-slot-title">{SLOT_LABELS[slot].title}</p>
                  <p className="accuse-slot-question">{SLOT_LABELS[slot].question}</p>
                </div>
                <div className="slot-control">
                  <button className={`slot-card${card ? ' is-filled' : ''}`} onClick={() => setPicking(slot)}>
                    {card ? (
                      <>
                        <span className="picker-card-id">{card.id}</span>
                        <span className="picker-card-name">{card.name}</span>
                      </>
                    ) : (
                      'Choose evidence'
                    )}
                  </button>
                  {card && (
                    <button
                      className="slot-clear"
                      onClick={() => setSlots((prev) => ({ ...prev, [slot]: undefined }))}
                      aria-label={`Clear ${SLOT_LABELS[slot].title}`}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="accuse-submit">
        <button className="btn btn-primary" disabled={!suspectId} onClick={() => setConfirming(true)}>
          Present the case
        </button>
        {!suspectId && <span className="accuse-submit-note">Choose a suspect first.</span>}
      </div>

      {picking && (
        <EvidencePicker
          title={SLOT_LABELS[picking].title}
          prompt={SLOT_LABELS[picking].question}
          cards={held}
          initial={slots[picking]}
          confirmLabel="Use this card"
          onPick={(id) => {
            setSlots((prev) => ({ ...prev, [picking]: id }));
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      )}

      {confirming && suspect && (
        <ConfirmDialog
          title={`Accuse ${suspect.name}?`}
          message={`Inspector Gale: “Once Mr. Brandt hears it, a weak case costs us credibility.${
            filled < SLOT_IDS.length
              ? ` You've left ${SLOT_IDS.length - filled} part${SLOT_IDS.length - filled > 1 ? 's' : ''} of the case empty.`
              : ''
          } Are you sure?”`}
          cancelLabel="Not yet"
          confirmLabel="Present it"
          onCancel={() => setConfirming(false)}
          onConfirm={submit}
        />
      )}
    </main>
  );
}
