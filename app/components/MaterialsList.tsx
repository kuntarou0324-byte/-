"use client";

import { useMemo, useState } from "react";
import type { Activity } from "../types";
import { aggregateMaterials } from "../lib/materials";

type Props = {
  activities: Activity[];
};

export function MaterialsList({ activities }: Props) {
  const [open, setOpen] = useState(false);
  const items = useMemo(() => aggregateMaterials(activities), [activities]);

  if (items.length === 0) return null;

  const handleCopy = async () => {
    const text = items.map((m) => `・${m.name} (${m.activities.length}件)`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      alert("クリップボードにコピーしました");
    } catch {
      alert("コピーに失敗しました");
    }
  };

  return (
    <section className="mb-6 rounded-lg border border-emerald-300 bg-emerald-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-emerald-900">
            必要物品リスト
            <span className="ml-2 text-xs font-normal text-emerald-700">
              ({items.length}種類)
            </span>
          </h2>
          <p className="text-xs text-emerald-800">
            このプランで必要な道具を集計しました。買い出し・準備リストとしてご利用ください。
          </p>
        </div>
        <div className="flex gap-2 no-print">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded border border-emerald-400 bg-white px-2.5 py-1 text-xs text-emerald-800 hover:bg-emerald-100"
          >
            コピー
          </button>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded border border-emerald-400 bg-white px-2.5 py-1 text-xs text-emerald-800 hover:bg-emerald-100"
          >
            {open ? "閉じる" : "開く"}
          </button>
        </div>
      </div>
      {open && (
        <ul className="border-t border-emerald-200 px-4 py-3 text-sm">
          {items.map((item) => (
            <li
              key={item.name}
              className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-b border-emerald-100 py-1.5 last:border-b-0"
            >
              <span className="font-medium text-slate-800">{item.name}</span>
              <span className="text-xs text-slate-500">
                ({item.activities.length}件)
              </span>
              <span className="ml-auto truncate text-xs text-slate-500">
                {item.activities
                  .slice(0, 4)
                  .map((a) =>
                    a.day_label ? `${a.day_label[0]}:${a.title}` : a.title,
                  )
                  .join(", ")}
                {item.activities.length > 4 ? " 他" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
