import './IntroScreen.css';

interface Props {
  paragraphs: string[];
  onContinue: () => void;
  onBack: () => void;
}

export default function IntroScreen({ paragraphs, onContinue, onBack }: Props) {
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
          {paragraphs.map((para) => (
            <p key={para}>{para}</p>
          ))}
          <p className="memo-sign">— R.G.</p>
          <p className="memo-ps">
            P.S. I'll be on hand throughout. If you get stuck, press <strong>Ask Gale</strong> at the top of the
            screen and I'll suggest where to look next.
          </p>
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
