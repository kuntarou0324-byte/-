"use client";

import { useEffect, useState } from "react";
import { ActivityCard } from "./components/ActivityCard";
import { AskModal } from "./components/AskModal";
import { ExecutionMode } from "./components/ExecutionMode";
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

type GenerateMode = "single" | "weekly";

export default function HomePage() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [mode, setMode] = useState<GenerateMode>("single");
  const [loading, setLoading] = useState(false);
  const [variationLoadingIndex, setVariationLoadingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<SavedActivity[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [executionActivity, setExecutionActivity] = useState<Activity | null>(null);
  const [askActivity, setAskActivity] = useState<Activity | null>(null);

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

  const addToHistory = (titles: string[]) => {
    if (titles.length === 0) return;
    const updated = [...titles, ...history].slice(0, HISTORY_LIMIT);
    persistHistory(updated);
  };

  const generate = async (payload: FormState, generateMode: GenerateMode) => {
    setLoading(true);
    setError(null);
    setActivities([]);
    setMode(generateMode);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          avoidTitles: history,
          mode: generateMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "生成に失敗しました");
      }
      const newActivities: Activity[] = data.activities ?? [];
      setActivities(newActivities);
      addToHistory(newActivities.map((a) => a.title));
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラー");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => generate(form, "single");

  const handleTodayRecommendation = () => {
    const todayPayload: FormState = {
      ...defaultForm,
      season: getTodaySeasonContext(),
    };
    generate(todayPayload, "single");
  };

  const handleWeeklyPlan = () => generate(form, "weekly");

  const handleVariation = async (index: number) => {
    const original = activities[index];
    if (!original) return;
    setVariationLoadingIndex(index);
    setError(null);
    try {
      const existingTitles = activities.map((a) => a.title);
      const res = await fetch("/api/variation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original,
          form,
          avoidTitles: [...existingTitles, ...history],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "バリエーション生成に失敗しました");
      }
      const newActivity: Activity | undefined = data.activity;
      if (!newActivity) throw new Error("応答が不正です");
      // Preserve the day_label from the original (for weekly plans)
      if (original.day_label) newActivity.day_label = original.day_label;
      const next = [...activities];
      next[index] = newActivity;
      setActivities(next);
      addToHistory([newActivity.title]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラー");
    } finally {
      setVariationLoadingIndex(null);
    }
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
          条件を入力すると、AI が安全に配慮したレクリエーション案を提案します。
        </p>
      </header>

      <section className="mb-6 grid gap-3 md:grid-cols-2 no-print">
        <div className="rounded-lg border-2 border-primary-300 bg-primary-50 p-5">
          <h2 className="text-lg font-bold text-primary-800">
            今日のおすすめ
          </h2>
          <p className="mt-1 text-sm text-slate-700">
            今日の季節・行事に合った案を 3 つすぐ生成。
            {todayTheme && (
              <span className="ml-1 text-primary-700">
                (今日のテーマ: {todayTheme})
              </span>
            )}
          </p>
          <button
            onClick={handleTodayRecommendation}
            disabled={loading}
            className="mt-3 w-full rounded bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && mode === "single" ? "生成中…" : "今日のおすすめを生成"}
          </button>
        </div>

        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-5">
          <h2 className="text-lg font-bold text-amber-800">週間プラン</h2>
          <p className="mt-1 text-sm text-slate-700">
            月曜〜金曜の5日分を、カテゴリのバランスを考えて一括生成。
          </p>
          <button
            onClick={handleWeeklyPlan}
            disabled={loading}
            className="mt-3 w-full rounded bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && mode === "weekly" ? "生成中…" : "週間プランを生成"}
          </button>
        </div>
      </section>

      <div className="mb-4 flex items-center gap-2 no-print">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-500">または条件を指定して3案生成</span>
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
            <h2 className="text-xl font-bold">
              {mode === "weekly" ? "週間プラン" : "提案された活動"}
            </h2>
            <button
              onClick={() => window.print()}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              印刷
            </button>
          </div>
          <div
            className={
              mode === "weekly"
                ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                : "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            }
          >
            {activities.map((activity, i) => (
              <ActivityCard
                key={i}
                activity={activity}
                onSave={() => handleSave(activity)}
                onVariation={() => handleVariation(i)}
                onExecute={() => setExecutionActivity(activity)}
                onAsk={() => setAskActivity(activity)}
                variationLoading={variationLoadingIndex === i}
              />
            ))}
          </div>
        </section>
      )}

      {favorites.length > 0 && (
        <section className="mt-12 no-print">
          <h2 className="mb-4 text-xl font-bold">お気に入り</h2>
          <SavedList
            items={favorites}
            onRemove={handleRemove}
            onExecute={(a) => setExecutionActivity(a)}
            onAsk={(a) => setAskActivity(a)}
          />
        </section>
      )}

      {executionActivity && (
        <ExecutionMode
          activity={executionActivity}
          onClose={() => setExecutionActivity(null)}
        />
      )}

      {askActivity && (
        <AskModal
          activity={askActivity}
          onClose={() => setAskActivity(null)}
        />
      )}
    </main>
  );
}
