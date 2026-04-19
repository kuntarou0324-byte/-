"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ExecutionRecord } from "../types";
import {
  filterByMonth,
  listMonthsWithRecords,
  recordsToCsv,
  summarize,
  summaryToCsv,
} from "../lib/reports";

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [records, setRecords] = useState<ExecutionRecord[]>([]);
  const [month, setMonth] = useState<string>(currentMonth());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/records");
        const data = await res.json();
        setRecords(data.items ?? []);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const months = useMemo(() => {
    const withData = listMonthsWithRecords(records);
    const set = new Set(withData);
    set.add(month);
    set.add(currentMonth());
    return Array.from(set).sort().reverse();
  }, [records, month]);

  const summary = useMemo(() => summarize(records, month), [records, month]);
  const monthRecords = useMemo(() => filterByMonth(records, month), [records, month]);

  const maxCategoryCount = Math.max(1, ...summary.byCategory.map((c) => c.count));
  const maxDowCount = Math.max(1, ...summary.byDow.map((d) => d.count));
  const totalReactions = summary.byReaction.reduce((acc, r) => acc + r.count, 0);

  const handleDownloadRecordsCsv = () => {
    downloadText(`records-${month}.csv`, recordsToCsv(monthRecords));
  };
  const handleDownloadSummaryCsv = () => {
    downloadText(`summary-${month}.csv`, summaryToCsv(summary));
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex items-start justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-primary-700">月次レポート</h1>
          <p className="mt-1 text-sm text-slate-600">
            匿名の実施記録を集計して、カテゴリ・反応・曜日の傾向を確認できます。
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/"
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            プランナーへ戻る
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            印刷
          </button>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3 no-print">
        <label className="text-sm font-medium text-slate-700">
          対象月:
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="ml-2 rounded border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleDownloadSummaryCsv}
          className="rounded border border-primary-300 bg-primary-50 px-3 py-1.5 text-xs text-primary-800 hover:bg-primary-100"
        >
          月次サマリ CSV
        </button>
        <button
          type="button"
          onClick={handleDownloadRecordsCsv}
          className="rounded border border-primary-300 bg-primary-50 px-3 py-1.5 text-xs text-primary-800 hover:bg-primary-100"
        >
          記録一覧 CSV
        </button>
      </div>

      {loaded && records.length === 0 ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-sm text-slate-600">
          実施記録がまだありません。レクを実施後に「実施を記録」から登録してください。
        </div>
      ) : (
        <>
          <section className="mb-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">実施数</div>
              <div className="mt-1 text-3xl font-bold text-primary-700">
                {summary.totalCount}
                <span className="ml-1 text-sm font-normal text-slate-500">件</span>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">延べ参加者</div>
              <div className="mt-1 text-3xl font-bold text-primary-700">
                {summary.totalParticipants}
                <span className="ml-1 text-sm font-normal text-slate-500">名</span>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">好評率</div>
              <div className="mt-1 text-3xl font-bold text-primary-700">
                {totalReactions === 0
                  ? "-"
                  : `${Math.round(
                      ((summary.byReaction.find((r) => r.reaction === "好評")?.count ?? 0) /
                        totalReactions) *
                        100,
                    )}%`}
              </div>
            </div>
          </section>

          <section className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">カテゴリ別</h2>
              {summary.byCategory.length === 0 ? (
                <p className="text-xs text-slate-500">データなし</p>
              ) : (
                <ul className="space-y-1.5">
                  {summary.byCategory.map((c) => (
                    <li key={c.category} className="flex items-center gap-2">
                      <span className="w-24 shrink-0 truncate text-xs text-slate-700">
                        {c.category}
                      </span>
                      <div className="h-4 flex-1 rounded bg-slate-100">
                        <div
                          className="h-4 rounded bg-primary-500"
                          style={{ width: `${(c.count / maxCategoryCount) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs tabular-nums text-slate-700">
                        {c.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">反応分布</h2>
              {totalReactions === 0 ? (
                <p className="text-xs text-slate-500">データなし</p>
              ) : (
                <ul className="space-y-1.5">
                  {summary.byReaction.map((r) => {
                    const pct = totalReactions === 0 ? 0 : (r.count / totalReactions) * 100;
                    const color =
                      r.reaction === "好評"
                        ? "bg-emerald-500"
                        : r.reaction === "普通"
                          ? "bg-slate-400"
                          : "bg-amber-500";
                    return (
                      <li key={r.reaction} className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-xs text-slate-700">
                          {r.reaction}
                        </span>
                        <div className="h-4 flex-1 rounded bg-slate-100">
                          <div
                            className={`h-4 rounded ${color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-xs tabular-nums text-slate-700">
                          {r.count} ({Math.round(pct)}%)
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          <section className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">曜日別</h2>
              <ul className="flex items-end gap-2">
                {summary.byDow.map((d) => (
                  <li key={d.dow} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-20 w-full items-end">
                      <div
                        className="w-full rounded-t bg-primary-400"
                        style={{ height: `${(d.count / maxDowCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-700">{d.dow}</span>
                    <span className="text-[10px] tabular-nums text-slate-500">{d.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">実施回数トップ</h2>
              {summary.topActivities.length === 0 ? (
                <p className="text-xs text-slate-500">データなし</p>
              ) : (
                <ol className="space-y-1">
                  {summary.topActivities.map((t, i) => (
                    <li
                      key={t.title}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <span className="w-5 shrink-0 text-right text-xs tabular-nums text-slate-500">
                        {i + 1}.
                      </span>
                      <span className="min-w-0 flex-1 truncate">{t.title}</span>
                      <span className="shrink-0 text-xs tabular-nums text-slate-500">
                        {t.count}回
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
