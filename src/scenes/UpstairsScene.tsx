// Upstairs landing illustration. Decorative only; hotspots are positioned by uiContent.ts.

export default function UpstairsScene() {
  return (
    <svg className="scene-art" viewBox="0 0 1000 600" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="up-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2e2236" />
          <stop offset="1" stopColor="#1a1420" />
        </linearGradient>
        <pattern id="up-stripe" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="12" height="24" fill="#352840" />
        </pattern>
        <radialGradient id="up-sconce">
          <stop offset="0" stopColor="rgba(255,200,120,0.45)" />
          <stop offset="1" stopColor="rgba(255,200,120,0)" />
        </radialGradient>
        <radialGradient id="up-vignette" cx="50%" cy="50%" r="75%">
          <stop offset="0.55" stopColor="rgba(0,0,0,0)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.75)" />
        </radialGradient>
      </defs>

      <rect width="1000" height="430" fill="url(#up-wall)" />
      <rect width="1000" height="400" fill="url(#up-stripe)" opacity="0.5" />
      <rect y="400" width="1000" height="30" fill="#2a1a10" />
      <rect y="430" width="1000" height="170" fill="#1e140c" />
      <path d="M0 470 H1000 V560 H0 Z" fill="#5a1e1e" opacity="0.75" />

      {/* Three bedroom doors */}
      {[200, 500, 800].map((x, i) => (
        <g key={x}>
          <rect x={x - 66} y="140" width="132" height="262" fill="#2a1a10" />
          <rect x={x - 56} y="150" width="112" height="252" fill="#4a2e1a" />
          <rect x={x - 46} y="164" width="92" height="100" fill="none" stroke="#3a2212" strokeWidth="3" />
          <rect x={x - 46} y="280" width="92" height="104" fill="none" stroke="#3a2212" strokeWidth="3" />
          <circle cx={x + 40} cy="280" r="5" fill="#c9a35f" />
          {/* Victoria's door stands ajar */}
          {i === 2 && <path d={`M${x - 56} 150 L${x - 30} 160 V396 L${x - 56} 402 Z`} fill="#1a1008" />}
        </g>
      ))}

      {/* Sconces between doors */}
      {[350, 650].map((x) => (
        <g key={x}>
          <circle cx={x} cy="190" r="70" fill="url(#up-sconce)" />
          <rect x={x - 4} y="180" width="8" height="26" fill="#c9a35f" />
          <path d={`M${x} 166 q6 8 0 14 q-6 -6 0 -14`} fill="#ffd27a" />
        </g>
      ))}

      {/* Banister at the head of the stairs */}
      <rect y="540" width="1000" height="14" fill="#3d2616" />
      {Array.from({ length: 21 }, (_, i) => (
        <rect key={i} x={i * 50} y="554" width="10" height="46" fill="#3d2616" />
      ))}

      <rect width="1000" height="600" fill="url(#up-vignette)" />
    </svg>
  );
}
