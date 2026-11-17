import type { ReactNode } from "react";
import type { TrackId } from "../modules/registry";

/** Ícones de interface (traço de 2 px, herdam a cor do texto). */
const PATHS = {
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  reset: (
    <>
      <path d="M4 12a8 8 0 1 0 2.6-5.9" />
      <path d="M4 4v5h5" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.1 1.1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.1-1.1" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  grid: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 9.5h16M4 14.5h16M9.5 4v16M14.5 4v16" />
    </>
  ),
  drag: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="m10 4.5 2-1.5 2 1.5M10 19.5l2 1.5 2-1.5M4.5 10 3 12l1.5 2M19.5 10l1.5 2-1.5 2" />
    </>
  ),
  edit: (
    <>
      <rect x="3.5" y="7" width="17" height="10" rx="2" />
      <path d="M8 10.5v3M12 10v4M16 10.5h-1.5a1.5 1.5 0 0 0 0 3H16" />
    </>
  ),
  share: (
    <>
      <circle cx="17.5" cy="5.5" r="2.5" />
      <circle cx="6.5" cy="12" r="2.5" />
      <circle cx="17.5" cy="18.5" r="2.5" />
      <path d="m8.7 10.7 6.6-3.9M8.7 13.3l6.6 3.9" />
    </>
  ),
  flask: (
    <>
      <path d="M9.5 3h5M10 3v6.2L4.8 18.3A1.8 1.8 0 0 0 6.4 21h11.2a1.8 1.8 0 0 0 1.6-2.7L14 9.2V3" />
      <path d="M7.2 15h9.6" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  frame: <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" />,
  cube: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="icon">
      {PATHS[name]}
    </svg>
  );
}

/** Ícone de cada trilha, desenhado no mesmo estilo de traço. A cor vem de `color` (normalmente a cor da trilha). */
const TRACK_ICONS: Record<TrackId, ReactNode> = {
  vetores: (
    <>
      <path d="M8 32 25 15" />
      <polygon points="30,10 28.2,18.1 21.9,11.8" className="fill" />
      <path d="M8 32h11" opacity="0.45" />
      <circle cx="8" cy="32" r="2.2" className="fill" />
    </>
  ),
  "retas-planos": (
    <>
      <polygon points="5,26 22,33 35,22 18,15" className="soft" />
      <path d="M20 4v13" />
      <path d="M20 29v7" strokeDasharray="2.5 3" opacity="0.6" />
      <circle cx="20" cy="23" r="2.4" className="fill" />
    </>
  ),
  conicas: (
    <>
      <ellipse cx="20" cy="20" rx="15" ry="8.5" transform="rotate(-25 20 20)" />
      <circle cx="12.5" cy="23.5" r="2" className="fill" />
      <circle cx="27.5" cy="16.5" r="2" className="fill" />
    </>
  ),
  quadricas: (
    <>
      <ellipse cx="20" cy="11" rx="13" ry="4.5" className="soft" />
      <path d="M7 11c1.5 13 6 21 13 21s11.5-8 13-21" />
      <path d="M11 22c2.5 1.6 5.6 2.4 9 2.4s6.5-.8 9-2.4" opacity="0.5" />
    </>
  ),
  sistemas: (
    <>
      <path d="M12 7H8v26h4M28 7h4v26h-4" />
      {[14, 20, 26].flatMap((y) => [15, 20, 25].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.7" className="fill" />))}
    </>
  ),
  espacos: (
    <>
      <path d="M8 30l18-6M11 21l18-6M14 12l18-6" />
      <path d="M8 30l6-18M17 27l6-18M26 24l6-18" opacity="0.55" />
      <circle cx="8" cy="30" r="2" className="fill" />
    </>
  ),
  transformacoes: (
    <>
      <rect x="5" y="20" width="11" height="11" strokeDasharray="2.5 2.5" opacity="0.55" />
      <polygon points="21,31 32,31 36,19 25,19" className="soft" />
      <path d="M10 15c3-6 10-8 15-5" />
      <path d="m22 7 3.5 3-3.8 2.5" />
    </>
  ),
  autovalores: (
    <>
      <path d="M4 34 36 6" strokeDasharray="2.5 3" opacity="0.5" />
      <path d="M11 27.9 22.4 18" />
      <polygon points="28,13.1 24.4,21.4 19.7,16" className="fill" />
      <circle cx="11" cy="27.9" r="2" className="fill" />
    </>
  ),
};

export function TrackIcon({ id, size = 40 }: { id: TrackId; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="track-icon">
      {TRACK_ICONS[id]}
    </svg>
  );
}
