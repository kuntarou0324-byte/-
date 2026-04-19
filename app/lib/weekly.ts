const DAY_TO_INDEX: Record<string, number> = {
  月曜日: 1,
  火曜日: 2,
  水曜日: 3,
  木曜日: 4,
  金曜日: 5,
  土曜日: 6,
  日曜日: 0,
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function startOfThisWeekMonday(today: Date = new Date()): Date {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dow = d.getDay();
  const daysFromMonday = (dow + 6) % 7;
  d.setDate(d.getDate() - daysFromMonday);
  return d;
}

export function dayLabelToDate(dayLabel: string, monday: Date): string | null {
  const idx = DAY_TO_INDEX[dayLabel];
  if (idx === undefined) return null;
  const offset = idx === 0 ? 6 : idx - 1;
  const d = new Date(monday);
  d.setDate(d.getDate() + offset);
  return toDateString(d);
}

export const WEEKDAY_ORDER = [
  "月曜日",
  "火曜日",
  "水曜日",
  "木曜日",
  "金曜日",
  "土曜日",
  "日曜日",
] as const;
