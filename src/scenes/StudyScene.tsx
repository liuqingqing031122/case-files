// Study illustration. Decorative only; hotspots are positioned by uiContent.ts.

export default function StudyScene() {
  return (
    <svg className="scene-art" viewBox="0 0 1000 600" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="st-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2618" />
          <stop offset="1" stopColor="#22160e" />
        </linearGradient>
        <linearGradient id="st-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a1f1a" />
          <stop offset="1" stopColor="#140a08" />
        </linearGradient>
        <linearGradient id="st-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a2c18" />
          <stop offset="1" stopColor="#2a180c" />
        </linearGradient>
        <radialGradient id="st-lamp">
          <stop offset="0" stopColor="rgba(255,210,140,0.5)" />
          <stop offset="1" stopColor="rgba(255,210,140,0)" />
        </radialGradient>
        <radialGradient id="st-vignette" cx="50%" cy="50%" r="75%">
          <stop offset="0.55" stopColor="rgba(0,0,0,0)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.75)" />
        </radialGradient>
      </defs>

      {/* Panelled walls */}
      <rect width="1000" height="470" fill="url(#st-wall)" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={20 + i * 125} y="40" width="105" height="200" fill="none" stroke="#4a3220" strokeWidth="4" />
      ))}

      {/* Bookshelves */}
      {[40, 830].map((x) => (
        <g key={x}>
          <rect x={x} y="60" width="130" height="380" fill="#2a180c" stroke="#4a2c18" strokeWidth="6" />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3, 4, 5, 6].map((b) => (
              <rect
                key={`${r}-${b}`}
                x={x + 8 + b * 17}
                y={78 + r * 92 + ((b * 7) % 14)}
                width="13"
                height={70 - ((b * 7) % 14)}
                fill={['#5a1818', '#2d4a3a', '#6a5030', '#3b3b5a'][(r + b) % 4]}
              />
            )),
          )}
        </g>
      ))}

      {/* Jib door seam (to the dining room) */}
      <path d="M220 120 V440 M220 120 H290 M290 120 V440" stroke="#1a100a" strokeWidth="2" fill="none" />

      {/* Floor and rug */}
      <rect y="470" width="1000" height="130" fill="url(#st-floor)" />
      <path d="M180 600 L260 490 H740 L820 600 Z" fill="#5a1e1e" opacity="0.7" />

      {/* Lamp glow */}
      <circle cx="330" cy="250" r="140" fill="url(#st-lamp)" />

      {/* Desk */}
      <rect x="250" y="296" width="500" height="20" fill="#5a3620" />
      <rect x="270" y="316" width="460" height="160" fill="url(#st-desk)" />
      <rect x="420" y="330" width="160" height="146" fill="#1a0f08" />
      {/* Left pedestal: locked, undamaged */}
      <rect x="290" y="382" width="116" height="42" fill="#3d2414" stroke="#22140a" strokeWidth="3" />
      <circle cx="348" cy="403" r="4" fill="#c9a35f" />
      {/* Right pedestal: forced */}
      <rect x="594" y="386" width="116" height="42" fill="#3d2414" stroke="#22140a" strokeWidth="3" />
      <circle cx="652" cy="407" r="4" fill="#c9a35f" />
      <path d="M644 398 l-10 -10 M660 398 l12 -8 M648 418 l-6 10" stroke="#e8c79a" strokeWidth="2.5" />
      {/* Papers poking out of the forced drawer */}
      <rect x="700" y="356" width="56" height="12" fill="#e9dfc7" transform="rotate(-8 728 362)" />

      {/* Blotter, lamp, telephone */}
      <rect x="430" y="300" width="140" height="14" fill="#2d4a3a" />
      <rect x="320" y="226" width="6" height="72" fill="#c9a35f" />
      <path d="M296 226 h54 l-12 -30 h-30 z" fill="#2d4a3a" />
      <rect x="696" y="272" width="54" height="24" rx="6" fill="#141414" />
      <path d="M700 268 q24 -26 48 0" stroke="#141414" strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="430" y="290" width="18" height="8" fill="#e9dfc7" transform="rotate(4 439 294)" />

      {/* Cufflink glinting on the floor */}
      <circle cx="550" cy="528" r="4" fill="#c9a35f" />
      <circle cx="550" cy="528" r="9" fill="rgba(201,163,95,0.25)" />

      <rect width="1000" height="600" fill="url(#st-vignette)" />
    </svg>
  );
}
