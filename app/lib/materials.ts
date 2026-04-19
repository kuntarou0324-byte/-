import type { Activity } from "../types";

export type MaterialAggregate = {
  name: string;
  activities: { title: string; day_label?: string }[];
};

function normalize(name: string): string {
  return name
    .normalize("NFKC")
    .replace(/[\s　]+/g, "")
    .toLowerCase();
}

export function aggregateMaterials(activities: Activity[]): MaterialAggregate[] {
  const map = new Map<string, MaterialAggregate>();
  for (const a of activities) {
    for (const raw of a.materials) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const key = normalize(trimmed);
      const entry = map.get(key);
      if (entry) {
        entry.activities.push({ title: a.title, day_label: a.day_label });
      } else {
        map.set(key, {
          name: trimmed,
          activities: [{ title: a.title, day_label: a.day_label }],
        });
      }
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => b.activities.length - a.activities.length || a.name.localeCompare(b.name, "ja"),
  );
}
