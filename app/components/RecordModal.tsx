"use client";

import { useEffect, useState } from "react";
import type { Activity, ExecutionRecord } from "../types";

type Props = {
  activity: Activity;
  onClose: () => void;
  onSave: (record: Omit<ExecutionRecord, "id" | "createdAt">) => void;
};

const reactions: ExecutionRecord["reaction"][] = ["好評", "普通", "反応薄い"];

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function RecordModal({ activity, onClose, onSave }: Props) {
  const [date, setDate] = useState(todayISO());
  const [participants, setParticipants] = useState<string>("10");
  const [reaction, setReaction] = useState<ExecutionRecord["reaction"]>("好評");
  const [note, setNote] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = () => {
    const p = parseInt(participants, 10);
    onSave({
      activityTitle: activity.title,
      activityCategory: activity.category,
      date,
      participants: isNaN(p) ? 0 : p,
      reaction,
      note: note.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-900">
              実施を記録
            </h2>
            <p className="truncate text-xs text-slate-500">{activity.title}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
            aria-label="閉じる"
          >
            ×
          </button>
        </header>

        <div className="space-y-4 px-5 py-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">実施日</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              参加人数
            </span>
            <input
              type="number"
              min="0"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </label>

          <div>
            <span className="text-sm font-medium text-slate-700">反応</span>
            <div className="mt-1 flex gap-2">
              {reactions.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReaction(r)}
                  className={`flex-1 rounded border px-3 py-2 text-sm font-medium transition ${
                    reaction === r
                      ? r === "好評"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : r === "普通"
                          ? "border-slate-500 bg-slate-100 text-slate-700"
                          : "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              職員メモ
              <span className="ml-1 text-xs text-slate-500">(任意)</span>
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="例: 〇〇さんがとても笑顔だった。次回は道具を増やしたい。"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </label>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            className="rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            保存
          </button>
        </footer>
      </div>
    </div>
  );
}
