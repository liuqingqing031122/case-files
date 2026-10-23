import type { ReactNode } from 'react';
import type { ArtKind } from '../game/uiContent';

// Small "exhibit photograph" illustrations, one per kind of evidence.
// All share the same 200×200 sepia frame so the polaroids feel like a set.

export default function EvidenceArt({ kind, label }: { kind: ArtKind; label: string }) {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={label}>
      <defs>
        <radialGradient id={`photo-${kind}`} cx="45%" cy="40%" r="70%">
          <stop offset="0" stopColor="#6d6458" />
          <stop offset="1" stopColor="#2b2722" />
        </radialGradient>
        <linearGradient id={`glass-${kind}`} x1="0" x2="1">
          <stop offset="0" stopColor="#4a2a14" />
          <stop offset="0.35" stopColor="#7a4a24" />
          <stop offset="0.5" stopColor="#9a6438" />
          <stop offset="1" stopColor="#3a200f" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#photo-${kind})`} />
      {ART[kind](kind)}
    </svg>
  );
}

const lines = (x: number, y: number, widths: number[], gap = 10, color = '#6a5c4c') =>
  widths.map((w, i) => <line key={i} x1={x} y1={y + i * gap} x2={x + w} y2={y + i * gap} stroke={color} strokeWidth="2.5" />);

const ART: Record<ArtKind, (kind: ArtKind) => ReactNode> = {
  document: () => (
    <g transform="rotate(-6 100 100)">
      <rect x="48" y="30" width="104" height="140" fill="#e9dfc7" />
      {lines(60, 50, [70, 80, 60, 78, 50, 74, 66, 40])}
      <path d="M118 150 q10 -12 24 -4" stroke="#3b3128" strokeWidth="2" fill="none" />
    </g>
  ),
  plan: () => (
    <g>
      <rect x="30" y="40" width="140" height="120" fill="#cfd8de" />
      <g stroke="#2d4a63" strokeWidth="3" fill="none">
        <rect x="40" y="50" width="70" height="100" />
        <rect x="110" y="50" width="50" height="100" />
      </g>
      <rect x="107" y="88" width="6" height="22" fill="#b02a2a" />
      <text x="58" y="104" fontSize="11" fill="#2d4a63" fontFamily="serif">Dining</text>
      <text x="117" y="104" fontSize="11" fill="#2d4a63" fontFamily="serif">Study</text>
    </g>
  ),
  bottle: (kind) => (
    <g>
      <ellipse cx="100" cy="170" rx="70" ry="12" fill="#8a6a3a" />
      <rect x="88" y="44" width="24" height="16" rx="3" fill="#c8b48a" />
      <rect x="92" y="58" width="16" height="12" fill={`url(#glass-${kind})`} />
      <path d="M72 78 q0 -8 12 -8 h32 q12 0 12 8 v80 q0 8 -8 8 h-40 q-8 0 -8 -8 z" fill={`url(#glass-${kind})`} />
      <rect x="78" y="100" width="44" height="36" fill="#e9dfc7" opacity="0.92" />
      {lines(83, 110, [32, 26, 30], 8)}
      <rect x="80" y="120" width="40" height="34" fill="#a8a23c" opacity="0.25" />
    </g>
  ),
  emptyBottle: (kind) => (
    <g>
      <ellipse cx="100" cy="178" rx="92" ry="20" fill="#2a1d14" />
      <path d="M10 150 q30 -30 60 -10 M190 140 q-35 -35 -70 -8" stroke="#3f5a35" strokeWidth="5" fill="none" strokeLinecap="round" />
      <g transform="rotate(-14 100 110)">
        <rect x="88" y="52" width="24" height="16" rx="3" fill="#c8b48a" />
        <rect x="92" y="66" width="16" height="12" fill={`url(#glass-${kind})`} />
        <path d="M74 84 q0 -8 12 -8 h28 q12 0 12 8 v74 q0 8 -8 8 h-36 q-8 0 -8 -8 z" fill={`url(#glass-${kind})`} />
        <rect x="80" y="104" width="40" height="34" fill="#e9dfc7" opacity="0.92" />
        {lines(84, 112, [32, 26, 30], 8)}
        <path d="M120 86 q4 18 0 34 q-2 10 2 22" stroke="#b7b14a" strokeWidth="3" fill="none" opacity="0.8" strokeLinecap="round" />
        <rect x="80" y="84" width="6" height="70" fill="#fff" opacity="0.08" />
      </g>
    </g>
  ),
  glass: () => (
    <g>
      <ellipse cx="100" cy="160" rx="60" ry="12" fill="#e9e2d0" />
      <path d="M76 70 h48 l-8 86 h-32 z" fill="#c9d4d8" opacity="0.55" stroke="#e8eef0" strokeWidth="2" />
      <path d="M86 140 h28 l-2 16 h-24 z" fill="#a8a23c" opacity="0.85" />
    </g>
  ),
  drawer: () => (
    <g>
      <rect x="20" y="60" width="160" height="90" fill="#3d2616" />
      <rect x="34" y="74" width="132" height="62" fill="#5a3a22" stroke="#2a1a10" strokeWidth="3" />
      <circle cx="100" cy="105" r="6" fill="#c9a35f" />
      <path d="M92 96 l-10 -12 M108 96 l14 -10 M96 114 l-8 14" stroke="#e8c79a" strokeWidth="3" />
    </g>
  ),
  cufflink: () => (
    <g>
      <rect x="20" y="130" width="160" height="40" fill="#3d2616" />
      <path d="M40 140 l20 -6 M120 150 l26 -8 M80 160 l18 4" stroke="#e8c79a" strokeWidth="3" />
      <ellipse cx="100" cy="120" rx="26" ry="20" fill="#c9a35f" />
      <ellipse cx="100" cy="120" rx="18" ry="13" fill="#141414" />
      <text x="100" y="125" fontSize="13" fill="#c9a35f" textAnchor="middle" fontFamily="serif">J.A.</text>
    </g>
  ),
  footprints: () => (
    <g>
      <rect width="200" height="200" fill="#4a3424" opacity="0.6" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${40 + i * 45} ${150 - i * 45})`}>
          <ellipse cx="0" cy="0" rx="10" ry="18" fill="#1d130c" />
          <ellipse cx="22" cy="12" rx="7" ry="12" fill="#2b1d12" />
        </g>
      ))}
    </g>
  ),
  book: () => (
    <g transform="rotate(4 100 100)">
      <rect x="42" y="40" width="116" height="130" fill="#5a2a22" />
      <rect x="50" y="46" width="102" height="118" fill="#e9dfc7" />
      {lines(60, 62, [80, 70, 76, 60, 78, 50, 72], 12)}
      <line x1="101" y1="46" x2="101" y2="164" stroke="#b9a988" strokeWidth="2" />
    </g>
  ),
  shirt: () => (
    <g>
      <path d="M50 50 l30 -14 h40 l30 14 l18 40 l-24 10 v74 h-88 v-74 l-24 -10 z" fill="#efeadf" />
      <path d="M90 36 l10 20 l10 -20" stroke="#bdb39c" strokeWidth="3" fill="none" />
      <rect x="150" y="84" width="20" height="14" fill="#efeadf" stroke="#bdb39c" />
      <circle cx="160" cy="92" r="5" fill="#a8a23c" opacity="0.7" />
    </g>
  ),
};
