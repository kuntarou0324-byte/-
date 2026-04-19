"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  date: string;
  initialMemo: string;
  onSaved?: (memo: string) => void;
};

type Status = "idle" | "saving" | "saved" | "error";

export function DayMemoEditor({ date, initialMemo, onSaved }: Props) {
  const [memo, setMemo] = useState(initialMemo);
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<string>(initialMemo);

  useEffect(() => {
    setMemo(initialMemo);
    lastSaved.current = initialMemo;
  }, [initialMemo, date]);

  useEffect(() => {
    if (memo === lastSaved.current) return;
    if (timer.current) clearTimeout(timer.current);
    setStatus("saving");
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/memos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, memo }),
        });
        if (!res.ok) throw new Error("save failed");
        lastSaved.current = memo;
        setStatus("saved");
        onSaved?.(memo);
      } catch {
        setStatus("error");
      }
    }, 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [memo, date, onSaved]);

  return (
    <div className="mb-3 rounded border border-amber-200 bg-amber-50/60 p-3 no-print">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-amber-900">
          引き継ぎメモ ({date})
        </span>
        <span className="text-[10px] text-slate-500">
          {status === "saving" && "保存中…"}
          {status === "saved" && "保存しました"}
          {status === "error" && "保存に失敗"}
        </span>
      </div>
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        rows={2}
        placeholder="例: 担当 田中 / 食堂で実施 / 雨天時は廊下で短縮版"
        className="w-full resize-y rounded border border-amber-200 bg-white px-2 py-1 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
      />
    </div>
  );
}
