import './BackLink.css';

/**
 * A "← Back to …" bar for detail screens. It sticks just below the game
 * header while scrolling, so the way back is always one tap away.
 */
export default function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="back-bar">
      <button className="back-link" onClick={onClick}>
        <span aria-hidden="true">←</span> {label}
      </button>
    </div>
  );
}
