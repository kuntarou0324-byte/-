"use client";

import { useEffect, useState } from "react";
import type { ExecutionRecord, FormState, SavedActivity } from "../types";
import type { Preset } from "./PresetManager";

const FAV_KEY = "recreation-favorites-v1";
const PRESETS_KEY = "recreation-presets-v1";
const RECORDS_KEY = "recreation-records-v1";
const MIGRATED_FLAG = "recreation-migrated-v1";

type Props = {
  onMigrated: (imported: {
    favorites: SavedActivity[];
    presets: Preset[];
    records: ExecutionRecord[];
  }) => void;
};

type Counts = { favorites: number; presets: number; records: number };

function readLocal<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function MigrationBanner({ onMigrated }: Props) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem(MIGRATED_FLAG) === "1") return;
    const favs = readLocal<SavedActivity>(FAV_KEY);
    const presets = readLocal<Preset>(PRESETS_KEY);
    const records = readLocal<ExecutionRecord>(RECORDS_KEY);
    const total = favs.length + presets.length + records.length;
    if (total === 0) {
      localStorage.setItem(MIGRATED_FLAG, "1");
      return;
    }
    setCounts({
      favorites: favs.length,
      presets: presets.length,
      records: records.length,
    });
  }, []);

  const run = async () => {
    setStatus("running");
    setMessage(null);
    const favorites = readLocal<SavedActivity>(FAV_KEY);
    const presets = readLocal<Preset>(PRESETS_KEY);
    const records = readLocal<ExecutionRecord>(RECORDS_KEY);
    try {
      const res = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorites, presets, records }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "移行に失敗しました");
      localStorage.setItem(MIGRATED_FLAG, "1");
      onMigrated({ favorites, presets, records });
      setStatus("done");
      setMessage(
        `サーバーへ移行しました (お気に入り ${data.imported.favorites}件 / プリセット ${data.imported.presets}件 / 実施記録 ${data.imported.records}件)`,
      );
      setCounts(null);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "不明なエラー");
    }
  };

  const dismiss = () => {
    if (!confirm("ブラウザのデータを破棄してよろしいですか? (サーバー側データは残ります)")) return;
    localStorage.setItem(MIGRATED_FLAG, "1");
    setCounts(null);
  };

  if (status === "done" && message) {
    return (
      <div className="mb-6 rounded border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800 no-print">
        {message}
      </div>
    );
  }

  if (!counts) return null;

  return (
    <div className="mb-6 rounded border border-amber-300 bg-amber-50 p-4 no-print">
      <p className="text-sm font-semibold text-amber-900">
        この端末にサーバー未登録のデータがあります
      </p>
      <p className="mt-1 text-xs text-amber-800">
        お気に入り {counts.favorites}件 / プリセット {counts.presets}件 / 実施記録 {counts.records}件
        をサーバーへ移行すると、他の端末からも共有できます。
      </p>
      {message && status === "error" && (
        <p className="mt-2 rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
          {message}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={run}
          disabled={status === "running"}
          className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "running" ? "移行中…" : "サーバーへ移行する"}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
        >
          後で / 破棄
        </button>
      </div>
    </div>
  );
}
