"use client";

import { useEffect, useState } from "react";
import { ActivityCard } from "./components/ActivityCard";
import { PlannerForm } from "./components/PlannerForm";
import { SavedList } from "./components/SavedList";
import type { Activity, FormState, SavedActivity } from "./types";

const STORAGE_KEY = "recreation-favorites-v1";

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

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const persist = (next: SavedActivity[]) => {
    setFavorites(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setActivities([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "生成に失敗しました");
      }
      setActivities(data.activities ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラー");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (activity: Activity) => {
    const saved: SavedActivity = {
      ...activity,
      savedAt: new Date().toISOString(),
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    persist([saved, ...favorites]);
  };

  const handleRemove = (id: string) => {
    persist(favorites.filter((f) => f.id !== id));
  };

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

      <section className="no-print">
        <PlannerForm
          form={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </section>

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
