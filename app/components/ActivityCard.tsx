import type { Activity, ExecutionRecord } from "../types";

type Props = {
  activity: Activity;
  onSave?: () => void;
  onRemove?: () => void;
  onVariation?: () => void;
  onExecute?: () => void;
  onAsk?: () => void;
  onRecord?: () => void;
  variationLoading?: boolean;
  savedAt?: string;
  records?: ExecutionRecord[];
  alreadySaved?: boolean;
};

export function ActivityCard({
  activity,
  onSave,
  onRemove,
  onVariation,
  onExecute,
  onAsk,
  onRecord,
  variationLoading,
  savedAt,
  records,
  alreadySaved,
}: Props) {
  const activityRecords = (records ?? []).filter(
    (r) => r.activityTitle === activity.title,
  );
  const goodCount = activityRecords.filter((r) => r.reaction === "好評").length;
  const poorCount = activityRecords.filter(
    (r) => r.reaction === "反応薄い",
  ).length;

  return (
    <article className="relative flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {variationLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 no-print">
          <span className="text-sm text-slate-700">別案を生成中…</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            {activity.day_label && (
              <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                {activity.day_label}
              </span>
            )}
            <span className="inline-block rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
              {activity.category}
            </span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-slate-900">
            {activity.title}
          </h3>
          <p className="text-xs text-slate-500">{activity.duration}</p>
          {activityRecords.length > 0 && (
            <p className="mt-1 text-xs text-slate-600">
              過去{activityRecords.length}回実施
              {goodCount > 0 && (
                <span className="ml-1 text-emerald-700">(好評 {goodCount})</span>
              )}
              {poorCount > 0 && (
                <span className="ml-1 text-amber-700">(反応薄 {poorCount})</span>
              )}
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-700">{activity.goal}</p>

      <Section title="準備物">
        <ul className="flex flex-wrap gap-1.5">
          {activity.materials.map((m, i) => (
            <li
              key={i}
              className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
            >
              {m}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="進め方">
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
          {activity.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </Section>

      <Section title="難易度調整">
        <div className="grid gap-2 text-sm">
          <div>
            <span className="font-medium text-slate-700">易化: </span>
            <span className="text-slate-700">
              {activity.difficulty_adjustments.easier}
            </span>
          </div>
          <div>
            <span className="font-medium text-slate-700">難化: </span>
            <span className="text-slate-700">
              {activity.difficulty_adjustments.harder}
            </span>
          </div>
        </div>
      </Section>

      <Section title="安全配慮">
        <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
          {activity.safety_notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </Section>

      <Section title="声かけ例">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {activity.talking_points.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </Section>

      {(onSave || onRemove || onVariation || onExecute || onAsk || onRecord) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 no-print">
          {savedAt && (
            <span className="text-xs text-slate-500">
              保存日: {new Date(savedAt).toLocaleDateString("ja-JP")}
            </span>
          )}
          <div className="ml-auto flex flex-wrap gap-2">
            {onExecute && (
              <button
                onClick={onExecute}
                disabled={variationLoading}
                className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ▶ 実施モード
              </button>
            )}
            {onRecord && (
              <button
                onClick={onRecord}
                disabled={variationLoading}
                className="rounded border border-emerald-500 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                実施を記録
              </button>
            )}
            {onAsk && (
              <button
                onClick={onAsk}
                disabled={variationLoading}
                className="rounded border border-slate-400 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                質問する
              </button>
            )}
            {onVariation && (
              <button
                onClick={onVariation}
                disabled={variationLoading}
                className="rounded border border-slate-400 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                別の案にする
              </button>
            )}
            {onSave && (
              <button
                onClick={onSave}
                disabled={variationLoading || alreadySaved}
                className="rounded border border-primary-600 px-3 py-1.5 text-sm text-primary-700 hover:bg-primary-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-500"
              >
                {alreadySaved ? "✓ 保存済み" : "お気に入りに保存"}
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                className="rounded border border-red-400 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
              >
                削除
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h4>
      {children}
    </div>
  );
}
