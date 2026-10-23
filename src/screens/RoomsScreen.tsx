import { isMet } from '../engine';
import { useGame } from '../game/GameContext';
import { ROOM_INFO } from '../game/uiContent';
import './RoomsScreen.css';

export default function RoomsScreen() {
  const { data, state, go } = useGame();

  return (
    <main className="page">
      <p className="page-kicker">The investigation</p>
      <h1 className="page-title">Rooms</h1>
      <p className="page-intro">Search the house. New rooms open as the household starts to talk.</p>

      <ul className="room-grid">
        {data.locations.map((location) => {
          const open = isMet(location.requires, state);
          const info = ROOM_INFO[location.id];
          return (
            <li key={location.id}>
              <button
                className={`room-card${open ? '' : ' is-locked'}`}
                // Locked rooms stay focusable so keyboard and screen-reader
                // users can read how to unlock them; they just don't open.
                onClick={() => open && go({ name: 'location', id: location.id })}
                aria-disabled={!open}
              >
                <span className="room-card-tab">{open ? 'Open' : 'Locked'}</span>
                <span className="room-card-name">{location.name}</span>
                <span className="room-card-text">{open ? info?.blurb : info?.lockedHint}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
