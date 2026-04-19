"use client";

import { useEffect, useState } from "react";
import type { Activity } from "../types";

type Props = {
  activity: Activity;
  onClose: () => void;
};

function parseMinutes(duration: string): number | null {
  const match = duration.match(/(\d+)\s*分/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ExecutionMode({ activity, onClose }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const targetMinutes = parseMinutes(activity.duration);
  const targetSeconds = targetMinutes ? targetMinutes * 60 : null;
  const overtime = targetSeconds !== null && elapsed > targetSeconds;

  const total = activity.steps.length;
  const isLast = stepIndex === total - 1;
  const isFirst = stepIndex === 0;

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && !isLast) setStepIndex((i) => i + 1);
      if (e.key === "ArrowLeft" && !isFirst) setStepIndex((i) => i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFirst, isLast, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-slate-900">
            {activity.title}
          </h2>
          <p className="text-xs text-slate-500">
            {activity.category} ・ {activity.duration}
          </p>
        </div>
        <div className="mx-4 text-right">
          <div
            className={`text-2xl font-mono font-bold ${
              overtime ? "text-red-600" : "text-slate-800"
            }`}
          >
            {formatTime(elapsed)}
          </div>
          {targetSeconds !== null && (
            <div className="text-xs text-slate-500">
              目標 {formatTime(targetSeconds)}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          aria-label="閉じる"
        >
          終了 ×
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-8 py-6">
        <div className="mb-4 text-lg font-semibold text-primary-600">
          ステップ {stepIndex + 1} / {total}
        </div>
        <p className="max-w-4xl text-center text-4xl font-bold leading-relaxed text-slate-900 md:text-5xl md:leading-snug">
          {activity.steps[stepIndex]}
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          {activity.steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStepIndex(i)}
              className={`h-3 w-3 rounded-full transition-all ${
                i === stepIndex
                  ? "w-8 bg-primary-600"
                  : i < stepIndex
                    ? "bg-primary-300"
                    : "bg-slate-300"
              }`}
              aria-label={`ステップ ${i + 1}`}
            />
          ))}
        </div>

        {showNotes && (
          <div className="mt-8 grid w-full max-w-4xl gap-4 md:grid-cols-2">
            <div className="rounded border border-red-200 bg-red-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-red-800">
                安全配慮
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
                {activity.safety_notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-slate-700">
                声かけ例
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {activity.talking_points.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>

      <footer className="flex items-center justify-between gap-4 border-t border-slate-200 px-6 py-4">
        <button
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst}
          className="rounded bg-slate-200 px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← 前へ
        </button>

        <button
          onClick={() => setShowNotes((v) => !v)}
          className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          {showNotes ? "メモを隠す" : "安全配慮・声かけを表示"}
        </button>

        {isLast ? (
          <button
            onClick={onClose}
            className="rounded bg-primary-600 px-6 py-3 text-base font-semibold text-white hover:bg-primary-700"
          >
            完了 ✓
          </button>
        ) : (
          <button
            onClick={() => setStepIndex((i) => Math.min(total - 1, i + 1))}
            className="rounded bg-primary-600 px-6 py-3 text-base font-semibold text-white hover:bg-primary-700"
          >
            次へ →
          </button>
        )}
      </footer>
    </div>
  );
}
