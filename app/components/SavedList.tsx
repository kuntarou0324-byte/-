"use client";

import { useMemo, useState } from "react";
import { ActivityCard } from "./ActivityCard";
import type { Activity, ExecutionRecord, SavedActivity } from "../types";

type Props = {
  items: SavedActivity[];
  records?: ExecutionRecord[];
  onRemove: (id: string) => void;
  onExecute?: (activity: Activity) => void;
  onAsk?: (activity: Activity) => void;
  onRecord?: (activity: Activity) => void;
};

type SortKey = "saved-desc" | "saved-asc" | "title";

const CATEGORIES = [
  "すべて",
  "体操",
  "脳トレ",
  "音楽",
  "創作",
  "季節行事",
  "ゲーム",
  "回想",
];

const DURATIONS = ["すべて", "15分", "30分", "45分", "60分"];

export function SavedList({
  items,
  records,
  onRemove,
  onExecute,
  onAsk,
  onRecord,
}: Props) {
  const [category, setCategory] = useState("すべて");
  const [duration, setDuration] = useState("すべて");
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<SortKey>("saved-desc");

  const filtered = useMemo(() => {
    let list = items;
    if (category !== "すべて") {
      list = list.filter((i) => i.category === category);
    }
    if (duration !== "すべて") {
      list = list.filter((i) => i.duration.includes(duration));
    }
    const kw = keyword.trim().toLowerCase();
    if (kw) {
      list = list.filter((i) => {
        const hay = [
          i.title,
          i.category,
          i.goal,
          i.materials.join(" "),
          i.steps.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(kw);
      });
    }
    const sorted = [...list];
    if (sort === "saved-desc") {
      sorted.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    } else if (sort === "saved-asc") {
      sorted.sort((a, b) => a.savedAt.localeCompare(b.savedAt));
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title, "ja"));
    }
    return sorted;
  }, [items, category, duration, keyword, sort]);

  const selectClass =
    "rounded border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="キーワード検索 (タイトル・目的・準備物…)"
          className="min-w-[200px] flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={selectClass}
          aria-label="カテゴリで絞り込み"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === "すべて" ? "カテゴリ: すべて" : c}
            </option>
          ))}
        </select>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className={selectClass}
          aria-label="所要時間で絞り込み"
        >
          {DURATIONS.map((d) => (
            <option key={d} value={d}>
              {d === "すべて" ? "時間: すべて" : d}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className={selectClass}
          aria-label="並び順"
        >
          <option value="saved-desc">新しい順</option>
          <option value="saved-asc">古い順</option>
          <option value="title">タイトル順</option>
        </select>
        <span className="text-xs text-slate-600">
          {filtered.length} / {items.length} 件
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">
          条件に一致するお気に入りはありません。
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <ActivityCard
              key={item.id}
              activity={item}
              savedAt={item.savedAt}
              records={records}
              onRemove={() => onRemove(item.id)}
              onExecute={onExecute ? () => onExecute(item) : undefined}
              onAsk={onAsk ? () => onAsk(item) : undefined}
              onRecord={onRecord ? () => onRecord(item) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
