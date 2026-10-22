import './IntroScreen.css';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export default function IntroScreen({ onContinue, onBack }: Props) {
  return (
    <main className="intro-screen">
      <article className="memo" aria-labelledby="memo-title">
        <header className="memo-header">
          <p className="memo-from">From the desk of Insp. R. Gale</p>
          <p className="memo-date">Friday, 14 Oct. 1932 · 8.00 a.m.</p>
        </header>

        <h1 id="memo-title" className="memo-title">
          Ashgrove Manor
        </h1>

        <div className="memo-body">
          <p>Detective,</p>
          <p>
            Sir Edmund Ashgrove collapsed at his own dinner table last night and died before the
            doctor arrived. He was due to sign a new will at ten o'clock this morning.
          </p>
          <p>
            Dr. Harlow suspects poison. He locked the dining room and the study before anyone
            could tidy them. Nobody in the household has been told what he found.
          </p>
          <p>
            Besides Sir Edmund, five people were in the house. At least one of them is lying to us. Start in the dining room.
          </p>
          <p className="memo-sign">— R.G.</p>
        </div>

        <footer className="memo-actions">
          <button className="btn btn-ghost-ink" onClick={onBack}>
            Back
          </button>
          <button className="btn btn-primary" onClick={onContinue} autoFocus>
            Step Inside
          </button>
        </footer>
      </article>
    </main>
  );
}
