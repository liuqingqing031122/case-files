import { useState } from 'react';
import EvidenceCard from '../components/EvidenceCard';
import { diningRoomHotspots, evidence, type SampleHotspot } from '../prototype/sampleData';
import './DiningRoomScreen.css';

interface Props {
  found: string[];
  onFind: (evidenceId: string) => void;
  onExit: () => void;
}

export default function DiningRoomScreen({ found, onFind, onExit }: Props) {
  const [visited, setVisited] = useState<string[]>([]);
  const [note, setNote] = useState<SampleHotspot | null>(null);
  const [openCard, setOpenCard] = useState<{ id: string; isNew: boolean } | null>(null);

  const inspect = (spot: SampleHotspot) => {
    setVisited((prev) => (prev.includes(spot.id) ? prev : [...prev, spot.id]));
    if (spot.evidenceId) {
      setNote(null);
      setOpenCard({ id: spot.evidenceId, isNew: !found.includes(spot.evidenceId) });
      onFind(spot.evidenceId);
    } else {
      setNote(spot);
    }
  };

  return (
    <main className="room-screen">
      <header className="room-header">
        <div>
          <p className="room-kicker">Ashgrove Manor · Ground floor</p>
          <h1 className="room-title">The Dining Room</h1>
        </div>
        <button className="btn btn-ghost" onClick={onExit}>
          Leave
        </button>
      </header>

      <div className="scene">
        <DiningRoomScene />
        {diningRoomHotspots.map((spot) => (
          <button
            key={spot.id}
            className={`hotspot${visited.includes(spot.id) ? ' is-visited' : ''}`}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            onClick={() => inspect(spot)}
            aria-label={`Inspect: ${spot.label}`}
          >
            <span className="hotspot-ring" aria-hidden="true" />
            <span className="hotspot-label">{spot.label}</span>
          </button>
        ))}
      </div>

      <p className="room-hint">Tap a glowing point to look closer.</p>

      {note && (
        <aside className="note-slip" aria-live="polite">
          <p className="note-title">{note.label}</p>
          <p className="note-text">{note.note}</p>
          <button className="note-close" onClick={() => setNote(null)} aria-label="Dismiss note">
            ×
          </button>
        </aside>
      )}

      <section className="case-tray" aria-label="Case file">
        <h2 className="case-tray-title">
          Case file <span className="case-tray-count">{found.length}</span>
        </h2>
        {found.length === 0 ? (
          <p className="case-tray-empty">No evidence collected yet.</p>
        ) : (
          <ul className="case-tray-list">
            {found.map((id) => (
              <li key={id}>
                <button
                  className="tray-item"
                  onClick={() => setOpenCard({ id, isNew: false })}
                >
                  <span className="tray-item-id">{id}</span>
                  {evidence[id].name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {openCard && (
        <EvidenceCard
          evidence={evidence[openCard.id]}
          isNew={openCard.isNew}
          onClose={() => setOpenCard(null)}
        />
      )}
    </main>
  );
}

/** Stylised CSS/SVG illustration of the dining room. Decorative only. */
function DiningRoomScene() {
  return (
    <svg className="scene-art" viewBox="0 0 1000 600" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c2620" />
          <stop offset="1" stopColor="#121915" />
        </linearGradient>
        <pattern id="damask" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M20 4 L36 20 L20 36 L4 20 Z" fill="none" stroke="#2a382f" strokeWidth="1.2" />
          <circle cx="20" cy="20" r="2" fill="#2a382f" />
        </pattern>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2e2018" />
          <stop offset="1" stopColor="#120c09" />
        </linearGradient>
        <linearGradient id="cloth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9e2d0" />
          <stop offset="1" stopColor="#bdb39c" />
        </linearGradient>
        <linearGradient id="pane" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b4a57" />
          <stop offset="1" stopColor="#1b242c" />
        </linearGradient>
        <radialGradient id="candle-glow">
          <stop offset="0" stopColor="rgba(255,200,120,0.55)" />
          <stop offset="1" stopColor="rgba(255,200,120,0)" />
        </radialGradient>
        <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
          <stop offset="0.55" stopColor="rgba(0,0,0,0)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.75)" />
        </radialGradient>
      </defs>

      {/* Wall, wainscot, floor */}
      <rect width="1000" height="420" fill="url(#wall)" />
      <rect width="1000" height="330" fill="url(#damask)" opacity="0.7" />
      <rect y="330" width="1000" height="90" fill="#24180f" />
      <rect y="330" width="1000" height="6" fill="#3a2717" />
      <rect y="420" width="1000" height="180" fill="url(#floor)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={i * 200 - 100} y1="600" x2={i * 160 + 100} y2="420" stroke="#0d0907" strokeWidth="2" opacity="0.6" />
      ))}

      {/* Window with rain */}
      <rect x="40" y="70" width="140" height="240" fill="#2b1d13" />
      <rect x="52" y="82" width="116" height="216" fill="url(#pane)" />
      <line x1="110" y1="82" x2="110" y2="298" stroke="#2b1d13" strokeWidth="6" />
      <line x1="52" y1="190" x2="168" y2="190" stroke="#2b1d13" strokeWidth="6" />
      <g className="rain" stroke="#8da2b3" strokeWidth="1.2" opacity="0.5">
        {[60, 75, 92, 120, 134, 150, 160, 70, 140].map((x, i) => (
          <line key={i} x1={x} y1={90 + ((i * 37) % 160)} x2={x - 4} y2={110 + ((i * 37) % 160)} />
        ))}
      </g>
      <path d="M20 60 h50 q-10 120 6 260 h-56 z" fill="#5a1818" />
      <path d="M200 60 h-50 q10 120 -6 260 h56 z" fill="#5a1818" />
      <rect x="14" y="52" width="192" height="12" rx="3" fill="#7a5a30" />

      {/* Portrait */}
      <rect x="420" y="80" width="150" height="170" fill="#6a4b25" />
      <rect x="432" y="92" width="126" height="146" fill="#1b1612" />
      <ellipse cx="495" cy="150" rx="26" ry="32" fill="#2c241d" />
      <path d="M450 238 q45 -70 90 0 z" fill="#2c241d" />

      {/* Sideboard with fern */}
      <rect x="740" y="290" width="210" height="110" fill="#2a1a10" />
      <rect x="730" y="282" width="230" height="12" fill="#3d2616" />
      <rect x="760" y="310" width="80" height="70" fill="#22150c" stroke="#3d2616" strokeWidth="3" />
      <rect x="850" y="310" width="80" height="70" fill="#22150c" stroke="#3d2616" strokeWidth="3" />
      <rect x="815" y="248" width="60" height="36" rx="4" fill="#8a6a3a" />
      <rect x="811" y="244" width="68" height="8" rx="3" fill="#a2804a" />
      <g stroke="#3f5f38" strokeWidth="5" fill="none" strokeLinecap="round">
        <path d="M845 246 q-40 -40 -80 -30" />
        <path d="M845 246 q-20 -60 -40 -80" />
        <path d="M845 246 q0 -70 6 -96" />
        <path d="M845 246 q30 -55 60 -70" />
        <path d="M845 246 q45 -30 85 -20" />
      </g>
      <g stroke="#567a4c" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8">
        <path d="M845 246 q-30 -48 -62 -54" />
        <path d="M845 246 q16 -62 34 -86" />
      </g>

      {/* Table */}
      <rect x="150" y="420" width="560" height="80" fill="#1a110b" />
      <path d="M170 392 L690 392 L720 430 L140 430 Z" fill="url(#cloth)" />
      <path d="M140 430 L720 430 L720 478 L140 478 Z" fill="#cfc6b0" />
      <path d="M140 478 L720 478" stroke="#a89d86" strokeWidth="2" />

      {/* Candles */}
      {[360, 560].map((x) => (
        <g key={x}>
          <circle cx={x} cy="330" r="60" fill="url(#candle-glow)" className="flame-glow" />
          <rect x={x - 10} y="384" width="20" height="10" fill="#b8955a" />
          <rect x={x - 3} y="340" width="6" height="46" fill="#efe6d2" />
          <path d={`M${x} 326 q6 8 0 14 q-6 -6 0 -14`} fill="#ffd27a" className="flame" />
        </g>
      ))}

      {/* Sir Edmund's place: covered glass */}
      <ellipse cx="300" cy="410" rx="34" ry="8" fill="#f4efe2" />
      <path d="M290 410 q10 -34 20 0 z" fill="#f4efe2" stroke="#cfc6b0" />
      <rect x="250" y="404" width="10" height="3" fill="#b8955a" />

      <rect width="1000" height="600" fill="url(#vignette)" />
    </svg>
  );
}
