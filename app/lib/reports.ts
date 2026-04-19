import type { ExecutionRecord } from "../types";

export type MonthlySummary = {
  month: string;
  totalCount: number;
  totalParticipants: number;
  byCategory: { category: string; count: number }[];
  byReaction: { reaction: ExecutionRecord["reaction"]; count: number }[];
  byDow: { dow: string; count: number }[];
  topActivities: { title: string; count: number; lastDate: string }[];
};

const REACTIONS: ExecutionRecord["reaction"][] = ["好評", "普通", "反応薄い"];
const DOW_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export function listMonthsWithRecords(records: ExecutionRecord[]): string[] {
  const set = new Set<string>();
  for (const r of records) {
    const m = r.date.slice(0, 7);
    if (/^\d{4}-\d{2}$/.test(m)) set.add(m);
  }
  return Array.from(set).sort().reverse();
}

export function filterByMonth(records: ExecutionRecord[], month: string): ExecutionRecord[] {
  return records.filter((r) => r.date.startsWith(month));
}

export function summarize(records: ExecutionRecord[], month: string): MonthlySummary {
  const inMonth = filterByMonth(records, month);

  const categoryMap = new Map<string, number>();
  const reactionMap = new Map<ExecutionRecord["reaction"], number>();
  const dowMap = new Map<string, number>();
  const titleMap = new Map<string, { count: number; lastDate: string }>();

  for (const reaction of REACTIONS) reactionMap.set(reaction, 0);

  let totalParticipants = 0;

  for (const r of inMonth) {
    categoryMap.set(r.activityCategory, (categoryMap.get(r.activityCategory) ?? 0) + 1);
    reactionMap.set(r.reaction, (reactionMap.get(r.reaction) ?? 0) + 1);
    const d = new Date(`${r.date}T00:00:00`);
    const dow = DOW_LABELS[d.getDay()] ?? "?";
    dowMap.set(dow, (dowMap.get(dow) ?? 0) + 1);
    totalParticipants += r.participants;
    const prev = titleMap.get(r.activityTitle);
    if (!prev) {
      titleMap.set(r.activityTitle, { count: 1, lastDate: r.date });
    } else {
      titleMap.set(r.activityTitle, {
        count: prev.count + 1,
        lastDate: r.date > prev.lastDate ? r.date : prev.lastDate,
      });
    }
  }

  const byCategory = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const byReaction = REACTIONS.map((reaction) => ({
    reaction,
    count: reactionMap.get(reaction) ?? 0,
  }));

  const byDow = DOW_LABELS.map((dow) => ({
    dow,
    count: dowMap.get(dow) ?? 0,
  }));

  const topActivities = Array.from(titleMap.entries())
    .map(([title, v]) => ({ title, count: v.count, lastDate: v.lastDate }))
    .sort((a, b) => b.count - a.count || b.lastDate.localeCompare(a.lastDate))
    .slice(0, 10);

  return {
    month,
    totalCount: inMonth.length,
    totalParticipants,
    byCategory,
    byReaction,
    byDow,
    topActivities,
  };
}

function escapeCsv(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function recordsToCsv(records: ExecutionRecord[]): string {
  const header = ["日付", "活動名", "カテゴリ", "参加人数", "反応", "備考"];
  const lines = [header.join(",")];
  for (const r of records) {
    lines.push(
      [
        r.date,
        r.activityTitle,
        r.activityCategory,
        r.participants,
        r.reaction,
        r.note,
      ]
        .map(escapeCsv)
        .join(","),
    );
  }
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}

export function summaryToCsv(summary: MonthlySummary): string {
  const lines: string[] = [];
  lines.push(`月次サマリ,${summary.month}`);
  lines.push(`実施数,${summary.totalCount}`);
  lines.push(`延べ参加者数,${summary.totalParticipants}`);
  lines.push("");
  lines.push("カテゴリ別,件数");
  for (const c of summary.byCategory) {
    lines.push(`${escapeCsv(c.category)},${c.count}`);
  }
  lines.push("");
  lines.push("反応分布,件数");
  for (const r of summary.byReaction) {
    lines.push(`${r.reaction},${r.count}`);
  }
  lines.push("");
  lines.push("曜日別,件数");
  for (const d of summary.byDow) {
    lines.push(`${d.dow},${d.count}`);
  }
  lines.push("");
  lines.push("実施回数トップ,活動名,回数,最終実施日");
  summary.topActivities.forEach((t, i) => {
    lines.push(`${i + 1},${escapeCsv(t.title)},${t.count},${t.lastDate}`);
  });
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}
