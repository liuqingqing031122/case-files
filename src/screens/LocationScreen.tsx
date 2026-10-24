import { useEffect, useRef, useState } from 'react';
import { findLocation, visibleHotspots, type HotspotDef } from '../engine';
import BackLink from '../components/BackLink';
import { scrollBehavior } from '../components/motion';
import EvidenceCard from '../components/EvidenceCard';
import DetectivesNote from '../components/DetectivesNote';
import { useGame } from '../game/GameContext';
import { useNotes } from '../game/useNotes';
import { HOTSPOT_POSITIONS } from '../game/uiContent';
import { SCENES } from '../scenes';
import './LocationScreen.css';

export default function LocationScreen({ locationId }: { locationId: string }) {
  const { data, state, act, go, setCoachTarget } = useGame();
  const notes = useNotes(['room-search', 'room-gale']);
  const galeNote = notes.next === 'room-gale';
  useEffect(() => {
    setCoachTarget(galeNote ? 'gale' : null);
    return () => setCoachTarget(null);
  }, [galeNote, setCoachTarget]);
  const focusNoteTarget = (id: string) =>
    (id === 'room-search'
      ? document.querySelector<HTMLElement>('.spot-item')
      : document.querySelector<HTMLElement>('.gale-button')
    )?.focus();
  // The observation being shown. `seq` changes on every click, so clicking the
  // same spot again replays the slip's entrance and brings it back into view.
  const [note, setNote] = useState<{ spot: HotspotDef; seq: number } | null>(null);
  const noteRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (note) noteRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
  }, [note]);
  const [openCard, setOpenCard] = useState<{ ids: string[]; isNew: boolean } | null>(null);

  const location = findLocation(data, locationId);
  if (!location) return null;
  const Scene = SCENES[location.id];
  const spots = visibleHotspots(location, state);

  const inspect = (spot: HotspotDef) => {
    const next = act({ type: 'examine', locationId: location.id, hotspotId: spot.id });
    const event = next.lastEvent;
    if (event.kind !== 'examined') return;
    if (spot.gives?.length) {
      setNote(null);
      // Show new cards first; on a revisit, show what this spot gave before.
      const isNew = event.gained.length > 0;
      setOpenCard({ ids: isNew ? event.gained : spot.gives, isNew });
    } else {
      setNote((prev) => ({ spot, seq: (prev?.seq ?? 0) + 1 }));
    }
  };

  const closeCard = () =>
    setOpenCard((card) => (card && card.ids.length > 1 ? { ...card, ids: card.ids.slice(1) } : null));

  return (
    <main className="page">
      <BackLink label="Back to Rooms" onClick={() => go({ name: 'rooms' })} />
      <p className="page-kicker">Ashgrove Manor</p>
      <h1 className="page-title">{location.name}</h1>

      {notes.next && (
        <DetectivesNote
          key={notes.next}
          id={notes.next}
          position={notes.position(notes.next)}
          onGotIt={(kb) => {
            const id = notes.next!;
            notes.dismiss(id);
            if (kb) focusNoteTarget(id);
          }}
          onSkip={(kb) => {
            const id = notes.next!;
            notes.skip();
            if (kb) focusNoteTarget(id);
          }}
        />
      )}

      <div className="scene-stage">
        <div className="scene">
          {Scene && <Scene />}
          {spots.map((spot) => {
            const pos = HOTSPOT_POSITIONS[spot.id] ?? { x: 50, y: 50 };
            return (
              <button
                key={spot.id}
                className={`hotspot${note?.spot.id === spot.id ? ' is-active' : ''}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => inspect(spot)}
                aria-label={`Inspect: ${spot.label}`}
              >
                <span className="hotspot-ring" aria-hidden="true" />
                <span className="hotspot-label">{spot.label}</span>
              </button>
            );
          })}
        </div>

        {/* Observations appear on the scene (desktop) or right under it (mobile), next to the click. */}
        {note && (
          <aside key={note.seq} ref={noteRef} className="note-slip scene-note" aria-live="polite">
            <p className="note-title">{note.spot.label}</p>
            <p className="note-text">{note.spot.note}</p>
            <button className="note-close" onClick={() => setNote(null)} aria-label="Dismiss note">
              ×
            </button>
          </aside>
        )}
      </div>

      <p className="room-hint">Tap a glowing point to look closer, or choose from the list below.</p>

      <ul
        className={`spot-list${notes.next === 'room-search' ? ' is-coached' : ''}`}
        aria-label={`Things to inspect in ${location.name}`}
      >
        {/* Deliberately no "examined" markers: players judge for themselves when a room is done. */}
        {spots.map((spot) => (
          <li key={spot.id}>
            <button className={`spot-item${note?.spot.id === spot.id ? ' is-active' : ''}`} onClick={() => inspect(spot)}>
              <span className="spot-check" aria-hidden="true">
                ⌕
              </span>
              {spot.label}
            </button>
          </li>
        ))}
      </ul>

      {openCard && (
        <EvidenceCard
          key={openCard.ids[0]}
          evidence={data.evidence[openCard.ids[0]]}
          isNew={openCard.isNew}
          onClose={closeCard}
          closeLabel={openCard.ids.length > 1 ? 'Next' : 'Return to the room'}
        />
      )}
    </main>
  );
}
