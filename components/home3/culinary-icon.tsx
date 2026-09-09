import type { ReactNode } from 'react';

type CulinaryCategory =
  | 'ontbijt'
  | 'broodjes'
  | 'salades'
  | 'warm'
  | 'zoet'
  | 'dranken'
  | 'klok'
  | 'link';

// Presentation-only mapping: the two menu datasets retain their own categories.
const categoryIcons: Record<string, CulinaryCategory> = {
  ontbijt: 'ontbijt',
  broodjes: 'broodjes',
  salades: 'salades',
  warm: 'warm',
  zoet: 'zoet',
  dranken: 'dranken',
  klok: 'klok',
  link: 'link',
};

// One pen family: rounded 1.5-unit strokes, open silhouettes and a few inner lines.
const drawings: Record<CulinaryCategory, ReactNode> = {
  link: <path d="M6 18 18 6M6 6h12v12" />,
  klok: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 6.5V12l3.8 2.3M12 3.5v1M20.5 12h-1M12 20.5v-1M3.5 12h1" />
    </>
  ),
  ontbijt: (
    <>
      <path d="M5.4 11C4.9 8.6 6 3 9.4 3s4.5 5.6 4 8M4.5 11h9.8c-.2 4-2.1 5.8-4.9 5.8S4.7 15 4.5 11ZM9.4 16.8V21M6 21h6.8" />
      <ellipse cx="19" cy="6" rx="1.7" ry="3" />
      <path d="M19 9v11" />
    </>
  ),
  broodjes: (
    <>
      <path d="M2.5 10.8C3.8 7.5 7.6 6 12.1 6c4.8 0 8.5 1.9 9.4 4.5L2.5 12ZM8.3 9l1.2-1M13.3 8.5l1.2-.8" />
      <path d="m2.8 13.8 3.6 1.1 3.5-1.2 4.2 1 4.2-1.2 2.9.3M2.8 16h18.4c-.7 1.6-2.8 2.4-5.2 2.4H7.8c-2.5 0-4.3-.8-5-2.4Z" />
    </>
  ),
  salades: (
    <>
      <path d="M3 13h18c-1.1 4.2-4 6.4-9 6.4S4.1 17.2 3 13ZM8 21h8" />
      <path d="M6.6 12C3.9 10.8 3.7 7.6 4.8 5.7c3.3.1 5.1 2.2 5.3 5.7M10.4 11C8.9 8.1 10.4 4.6 13.2 3.5c1.9 2.5 1.9 5.6-.1 8M15.1 12c-.3-3.1 2.1-5.4 5.2-5 .7 2.7-.8 5-3.8 5.6" />
    </>
  ),
  warm: (
    <>
      <path d="m9.9 4.9-6.5 10.8c-1.2 2.3 5.9 6.7 7.5 4.4L19 9.6" />
      <ellipse
        cx="14.5"
        cy="7.2"
        rx="5.2"
        ry="3.1"
        transform="rotate(27 14.5 7.2)"
      />
      <path d="m12.3 6.1 1.5 1.5 1.8-.4M15.7 8.8l1.1-.5M6.4 11.6c2 .2 5.4 2 7 4.2" />
    </>
  ),
  zoet: (
    <>
      <path d="m4.5 11 9.8-5.5c2.5.9 4.4 2.7 5.2 5.5h-15ZM4.5 11v6.2c4.9 1.2 10.1 1.2 15 0V11M4.5 14.5c4.9 1 10.1 1 15 0M2.5 20c5.7 1.2 13.3 1.2 19 0" />
    </>
  ),
  dranken: (
    <>
      <path d="M4 7h12v6.5c0 3-2.4 5-6 5s-6-2-6-5V7ZM16 8h2.4a3 3 0 0 1 0 6H16M2.5 20c5.8 1.4 13.2 1.4 19 0M9.5 4.3c-1-.6-.9-1.4-.2-2" />
    </>
  ),
};

export default function CulinaryIcon({ categoryId }: { categoryId: string }) {
  const category = categoryIcons[categoryId];
  if (!category) return null;
  return (
    <svg
      className="culinary-icon"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {drawings[category]}
    </svg>
  );
}
