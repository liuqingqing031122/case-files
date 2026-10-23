import { SUSPECT_INFO } from '../game/uiContent';

/** A sepia silhouette portrait with the suspect's initials. */
export default function Portrait({ suspectId, size = 96 }: { suspectId: string; size?: number }) {
  const info = SUSPECT_INFO[suspectId];
  const tint = info?.tint ?? '#444';
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" aria-hidden="true" className="portrait">
      <rect width="100" height="120" fill={tint} />
      <rect width="100" height="120" fill="url(#portrait-sheen)" />
      <defs>
        <radialGradient id="portrait-sheen" cx="50%" cy="30%" r="70%">
          <stop offset="0" stopColor="rgba(255,240,210,0.35)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.35)" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="48" rx="19" ry="23" fill="#16110e" />
      <path d="M14 120 q36 -64 72 0 z" fill="#16110e" />
      <text x="88" y="112" fontSize="11" fill="rgba(239,230,210,0.7)" textAnchor="end" fontFamily="'Special Elite', monospace">
        {info?.initials}
      </text>
    </svg>
  );
}
