import { NOTES, type NoteId } from '../game/tips';
import './DetectivesNote.css';

interface Props {
  id: NoteId;
  position?: { step: number; of: number };
  /** "Got it". `viaKeyboard` lets the screen move focus to the described control. */
  onGotIt: (viaKeyboard: boolean) => void;
  /** "Skip tips": disable future automatic notes. */
  onSkip: (viaKeyboard: boolean) => void;
}

/**
 * A short paper note in the page flow. It never covers or blocks the
 * interface and never takes focus on its own.
 */
export default function DetectivesNote({ id, position, onGotIt, onSkip }: Props) {
  const note = NOTES[id];
  const headingId = `note-${id}`;
  return (
    <section className="detectives-note" role="note" aria-labelledby={headingId}>
      <p className="detectives-note-kicker">
        Detective's note
        {position && position.of > 1 && (
          <span className="detectives-note-step">
            {' '}
            · {position.step} of {position.of}
          </span>
        )}
      </p>
      <h2 id={headingId} className="detectives-note-title">
        {note.title}
      </h2>
      <p className="detectives-note-text">{note.text}</p>
      <div className="detectives-note-actions">
        <button className="btn btn-ink detectives-note-ok" onClick={(e) => onGotIt(e.detail === 0)}>
          Got it
        </button>
        <button className="detectives-note-skip" onClick={(e) => onSkip(e.detail === 0)}>
          Skip tips
        </button>
      </div>
    </section>
  );
}
