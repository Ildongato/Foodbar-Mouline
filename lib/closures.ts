/** Temporary visual preview. Set to false to use only the actual calendar. */
export const closureDemoEnabled = true;

export const closureConfig = {
  timeZone: 'Europe/Brussels',
  annualVacation: { start: '07-19', end: '07-30' },
  exceptions: [
    { date: '2026-11-12', reason: 'Brugdag' },
    { date: '2027-05-07', reason: 'Brugdag' },
  ],
};

const fixedHolidays = [
  ['01-01', 'Nieuwjaar'],
  ['05-01', 'Dag van de Arbeid'],
  ['07-21', 'Nationale feestdag'],
  ['08-15', 'Onze-Lieve-Vrouw Hemelvaart'],
  ['11-01', 'Allerheiligen'],
  ['11-11', 'Wapenstilstand'],
  ['12-25', 'Kerstmis'],
] as const;

function shiftDate(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

/** Gregorian Easter (Meeus/Jones/Butcher); date arithmetic stays in UTC. */
function easter(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function statutoryHolidays(year: number) {
  const sunday = easter(year);
  return [
    ...fixedHolidays.map(([date, reason]) => ({
      date: `${year}-${date}`,
      reason,
    })),
    { date: shiftDate(sunday, 1), reason: 'Paasmaandag' },
    { date: shiftDate(sunday, 39), reason: 'Hemelvaart' },
    { date: shiftDate(sunday, 50), reason: 'Pinkstermaandag' },
  ].sort((a, b) => a.date.localeCompare(b.date));
}

export function closureReasons(date: string): string[] {
  const monthDay = date.slice(5);
  const { annualVacation, exceptions } = closureConfig;
  return [
    ...(monthDay >= annualVacation.start && monthDay <= annualVacation.end
      ? ['Jaarlijkse vakantie']
      : []),
    ...statutoryHolidays(Number(date.slice(0, 4)))
      .filter((holiday) => holiday.date === date)
      .map((holiday) => holiday.reason),
    ...exceptions.filter((day) => day.date === date).map((day) => day.reason),
  ];
}

export function brusselsDate(now: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: closureConfig.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('nl-BE', {
    timeZone: closureConfig.timeZone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00Z`));
}

export type ClosureNotice = { title: string; message: string; detail: string };

/** No demo data enters the production calendar, regular hours or structured data. */
export function getClosureNotice(
  now: Date,
  demo = false,
): ClosureNotice | null {
  const date = brusselsDate(now);
  if (demo)
    return {
      title: 'Even gesloten',
      message:
        'Mouline is vandaag gesloten. We zien je graag terug vanaf morgen.',
      detail: `Demo · Uitzonderlijke sluiting · ${formatDate(date)}`,
    };
  const reasons = closureReasons(date);
  if (!reasons.length) return null;
  let start = date;
  let end = date;
  const allReasons = new Set(reasons);
  // Combine adjacent holidays, bridge days and vacation, also across a year boundary.
  while (closureReasons(shiftDate(start, -1)).length)
    start = shiftDate(start, -1);
  while (closureReasons(shiftDate(end, 1)).length) end = shiftDate(end, 1);
  for (let day = start; day <= end; day = shiftDate(day, 1))
    closureReasons(day).forEach((reason) => allReasons.add(reason));
  return {
    title: 'Even gesloten',
    message:
      start === end
        ? 'Mouline is vandaag gesloten.'
        : `Mouline is vandaag gesloten. We zijn gesloten tot en met ${formatDate(end)}.`,
    detail: `${[...allReasons].join(' · ')} · ${formatDate(start)}${start !== end ? ` t.e.m. ${formatDate(end)}` : ''}`,
  };
}
