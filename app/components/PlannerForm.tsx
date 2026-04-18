"use client";

import type { FormState } from "../types";

type Props = {
  form: FormState;
  onChange: (form: FormState) => void;
  onSubmit: () => void;
  loading: boolean;
};

const participantOptions = ["〜5名", "6〜10名", "10〜15名", "15〜20名", "20名以上"];
const levelOptions = [
  "自立中心",
  "自立〜一部介助が中心",
  "一部介助〜全介助が中心",
  "認知症の方が多い",
  "混在",
];
const durationOptions = ["15分", "30分", "45分", "60分"];
const goalOptions = [
  "身体機能の維持と交流促進",
  "認知機能の活性化",
  "季節感・行事を楽しむ",
  "発声・嚥下機能の維持",
  "手指の巧緻性向上",
  "ストレス発散・気分転換",
];

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {hint && <span className="ml-2 text-xs text-slate-500">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function PlannerForm({ form, onChange, onSubmit, loading }: Props) {
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    onChange({ ...form, [key]: value });

  const inputClass =
    "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2"
    >
      <Field label="参加人数">
        <select
          className={inputClass}
          value={form.participants}
          onChange={(e) => update("participants", e.target.value)}
        >
          {participantOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Field>

      <Field label="身体機能レベル">
        <select
          className={inputClass}
          value={form.level}
          onChange={(e) => update("level", e.target.value)}
        >
          {levelOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Field>

      <Field label="所要時間">
        <select
          className={inputClass}
          value={form.duration}
          onChange={(e) => update("duration", e.target.value)}
        >
          {durationOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Field>

      <Field label="目的・ねらい">
        <select
          className={inputClass}
          value={form.goal}
          onChange={(e) => update("goal", e.target.value)}
        >
          {goalOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Field>

      <Field label="季節・行事" hint="任意(例: 春、七夕、敬老の日)">
        <input
          type="text"
          className={inputClass}
          value={form.season}
          placeholder="空欄でも可"
          onChange={(e) => update("season", e.target.value)}
        />
      </Field>

      <Field label="利用可能な道具" hint="カンマ区切り">
        <input
          type="text"
          className={inputClass}
          value={form.materials}
          onChange={(e) => update("materials", e.target.value)}
        />
      </Field>

      <Field label="避けたい活動" hint="任意(例: 立ち上がる運動)">
        <input
          type="text"
          className={inputClass}
          value={form.avoid}
          placeholder="空欄でも可"
          onChange={(e) => update("avoid", e.target.value)}
        />
      </Field>

      <div className="md:col-span-2 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "生成中…" : "レクリエーション案を生成"}
        </button>
      </div>
    </form>
  );
}
