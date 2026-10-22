import './TitleScreen.css';

interface Props {
  onEnter: () => void;
}

export default function TitleScreen({ onEnter }: Props) {
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
              <dd>Unsolved</dd>
            </div>
          </dl>

          <div className="stamp" aria-hidden="true">
            Confidential
          </div>

          <div className="folder-actions">
            <button className="btn btn-primary" onClick={onEnter} autoFocus>
              Enter the Manor
            </button>
          </div>
        </div>
      </div>

      <p className="title-footnote">Prototype build · progress is not saved yet</p>
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
