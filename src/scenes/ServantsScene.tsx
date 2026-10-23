// Servants' Hall illustration. Decorative only; hotspots are positioned by uiContent.ts.

export default function ServantsScene() {
  return (
    <svg className="scene-art" viewBox="0 0 1000 600" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sv-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4438" />
          <stop offset="1" stopColor="#2e2a22" />
        </linearGradient>
        <pattern id="sv-tiles" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="#2a2420" />
          <rect width="30" height="30" fill="#3a332c" />
          <rect x="30" y="30" width="30" height="30" fill="#3a332c" />
        </pattern>
        <linearGradient id="sv-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b242c" />
          <stop offset="1" stopColor="#0d1216" />
        </linearGradient>
        <radialGradient id="sv-stove">
          <stop offset="0" stopColor="rgba(255,140,60,0.45)" />
          <stop offset="1" stopColor="rgba(255,140,60,0)" />
        </radialGradient>
        <radialGradient id="sv-vignette" cx="50%" cy="50%" r="75%">
          <stop offset="0.55" stopColor="rgba(0,0,0,0)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.75)" />
        </radialGradient>
      </defs>

      <rect width="1000" height="440" fill="url(#sv-wall)" />
      <rect y="300" width="1000" height="140" fill="#d8d0bc" opacity="0.18" />
      <rect y="440" width="1000" height="160" fill="url(#sv-tiles)" />

      {/* Pantry shelves with the household book */}
      <rect x="60" y="110" width="220" height="230" fill="#3a2a1a" />
      {[150, 220, 290].map((y) => (
        <rect key={y} x="60" y={y} width="220" height="8" fill="#5a4028" />
      ))}
      {[80, 120, 160, 210, 240].map((x, i) => (
        <rect key={x} x={x} y={110 + (i % 2) * 6} width="24" height={34 - (i % 2) * 6} rx="4" fill={['#8a6a3a', '#5a6a5a', '#7a4a3a'][i % 3]} />
      ))}
      <rect x="130" y="198" width="60" height="22" fill="#5a2a22" />
      <rect x="134" y="200" width="52" height="4" fill="#e9dfc7" />
      {[80, 220].map((x) => (
        <ellipse key={x} cx={x + 20} cy="282" rx="18" ry="10" fill="#9a8a6a" />
      ))}

      {/* Back door, ajar onto the wet night */}
      <rect x="410" y="140" width="180" height="300" fill="#2a1d14" />
      <rect x="424" y="154" width="152" height="286" fill="url(#sv-night)" />
      <g stroke="#8da2b3" strokeWidth="1.2" opacity="0.45" className="rain">
        {[440, 470, 500, 530, 560, 455, 515, 545].map((x, i) => (
          <line key={i} x1={x} y1={170 + ((i * 41) % 200)} x2={x - 4} y2={192 + ((i * 41) % 200)} />
        ))}
      </g>
      <path d="M424 154 L500 170 L500 440 L424 440 Z" fill="#3d2a1c" />
      {/* Step with muddy prints */}
      <rect x="390" y="440" width="220" height="40" fill="#6a6258" />
      {[440, 480, 520, 555].map((x, i) => (
        <ellipse key={x} cx={x} cy={456 + (i % 2) * 10} rx={i % 2 ? 7 : 10} ry={i % 2 ? 11 : 14} fill="#3a2614" />
      ))}

      {/* Stove */}
      <circle cx="800" cy="300" r="150" fill="url(#sv-stove)" />
      <rect x="720" y="230" width="170" height="130" fill="#1a1a1a" />
      <rect x="740" y="290" width="50" height="40" fill="#e07a30" opacity="0.7" />
      <rect x="790" y="100" width="40" height="130" fill="#141414" />
      {/* Mrs. Pell's shoes drying */}
      <ellipse cx="690" cy="352" rx="16" ry="7" fill="#2a1a10" />
      <ellipse cx="712" cy="356" rx="16" ry="7" fill="#2a1a10" />

      {/* Laundry hamper */}
      <rect x="770" y="390" width="120" height="84" rx="6" fill="#8a6a3a" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="770" y1={402 + i * 16} x2="890" y2={402 + i * 16} stroke="#6a4a24" strokeWidth="3" />
      ))}
      <path d="M786 392 q30 -30 60 -6 q20 -20 36 6" fill="#efeadf" />

      <rect width="1000" height="600" fill="url(#sv-vignette)" />
    </svg>
  );
}
