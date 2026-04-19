"use client";

import type { ExecutionRecord } from "../types";

type Props = {
  records: ExecutionRecord[];
  onDelete: (id: string) => void;
};

const reactionStyle: Record<ExecutionRecord["reaction"], string> = {
  好評: "bg-emerald-100 text-emerald-800",
  普通: "bg-slate-100 text-slate-700",
  反応薄い: "bg-amber-100 text-amber-800",
};

export function RecordList({ records, onDelete }: Props) {
  if (records.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        まだ記録はありません。レクの実施後に「実施を記録」から登録できます。
      </p>
    );
  }

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <ul className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">
      {sorted.map((r) => (
        <li key={r.id} className="flex items-start gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {r.activityTitle}
              </span>
              <span className="rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-700">
                {r.activityCategory}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                  reactionStyle[r.reaction]
                }`}
              >
                {r.reaction}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {r.date} ・ {r.participants}名参加
            </div>
            {r.note && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {r.note}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              if (confirm("この実施記録を削除しますか?")) onDelete(r.id);
            }}
            className="rounded border border-red-300 px-2.5 py-1 text-xs text-red-700 hover:bg-red-50"
          >
            削除
          </button>
        </li>
      ))}
    </ul>
  );
}
