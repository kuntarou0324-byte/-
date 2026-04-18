"use client";

import { useEffect, useState } from "react";
import { ActivityCard } from "./components/ActivityCard";
import { PlannerForm } from "./components/PlannerForm";
import { SavedList } from "./components/SavedList";
import { getTodaySeasonContext } from "./lib/season";
import type { Activity, FormState, SavedActivity } from "./types";

const STORAGE_KEY = "recreation-favorites-v1";
const HISTORY_KEY = "recreation-history-v1";
const HISTORY_LIMIT = 30;

const defaultForm: FormState = {
  participants: "10〜15名",
  level: "自立〜一部介助が中心",
  duration: "30分",
  goal: "身体機能の維持と交流促進",
  season: "",
  materials: "新聞紙、タオル、お手玉、ペットボトル、色画用紙",
  avoid: "",
};

export default function HomePage() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<SavedActivity[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch {
        // ignore
      }
    }
  }, []);

  const persistFavorites = (next: SavedActivity[]) => {
    setFavorites(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const persistHistory = (next: string[]) => {
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const generate = async (payload: FormState) => {
    setLoading(true);
    setError(null);
    setActivities([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, avoidTitles: history }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "生成に失敗しました");
      }
      const newActivities: Activity[] = data.activities ?? [];
      setActivities(newActivities);
      if (newActivities.length > 0) {
        const newTitles = newActivities.map((a) => a.title);
        const updated = [...newTitles, ...history].slice(0, HISTORY_LIMIT);
        persistHistory(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラー");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => generate(form);

  const handleTodayRecommendation = () => {
    const todayPayload: FormState = {
      ...defaultForm,
      season: getTodaySeasonContext(),
    };
    generate(todayPayload);
  };

  const handleSave = (activity: Activity) => {
    const saved: SavedActivity = {
      ...activity,
      savedAt: new Date().toISOString(),
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    persistFavorites([saved, ...favorites]);
  };

  const handleRemove = (id: string) => {
    persistFavorites(favorites.filter((f) => f.id !== id));
  };

  const handleClearHistory = () => {
    if (confirm("生成履歴をクリアします。よろしいですか?")) {
      persistHistory([]);
    }
  };

  const todayTheme = getTodaySeasonContext();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 no-print">
        <h1 className="text-3xl font-bold text-primary-700">
          デイサービス レクリエーション プランナー
        </h1>
        <p className="mt-2 text-slate-600">
          条件を入力すると、AI が安全に配慮したレクリエーション案を3つ提案します。
        </p>
      </header>

      <section className="mb-6 rounded-lg border-2 border-primary-300 bg-primary-50 p-5 no-print">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary-800">
              今日のおすすめ
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              条件入力なしで、今日の季節・行事に合った案をすぐ生成します。
              {todayTheme && (
                <span className="ml-1 text-primary-700">
                  (今日のテーマ: {todayTheme})
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleTodayRecommendation}
            disabled={loading}
            className="w-full rounded bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            {loading ? "生成中…" : "今日のおすすめを生成"}
          </button>
        </div>
      </section>

      <div className="mb-4 flex items-center gap-2 no-print">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-500">または条件を指定して生成</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <section className="no-print">
        <PlannerForm
          form={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </section>

      {history.length > 0 && (
        <div className="mt-3 flex justify-end no-print">
          <button
            onClick={handleClearHistory}
            className="text-xs text-slate-500 underline hover:text-slate-700"
          >
            生成履歴をクリア ({history.length}件記憶中)
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-red-800 no-print">
          {error}
        </div>
      )}

      {activities.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4 no-print">
            <h2 className="text-xl font-bold">提案された活動</h2>
            <button
              onClick={() => window.print()}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              印刷
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity, i) => (
              <ActivityCard
                key={i}
                activity={activity}
                onSave={() => handleSave(activity)}
              />
            ))}
          </div>
        </section>
      )}

      {favorites.length > 0 && (
        <section className="mt-12 no-print">
          <h2 className="mb-4 text-xl font-bold">お気に入り</h2>
          <SavedList items={favorites} onRemove={handleRemove} />
        </section>
      )}
    </main>
  );
}
