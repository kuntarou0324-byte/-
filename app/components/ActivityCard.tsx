import type { Activity } from "../types";

type Props = {
  activity: Activity;
  onSave?: () => void;
  onRemove?: () => void;
  savedAt?: string;
};

export function ActivityCard({ activity, onSave, onRemove, savedAt }: Props) {
  return (
    <article className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="inline-block rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
            {activity.category}
          </span>
          <h3 className="mt-2 text-lg font-bold text-slate-900">
            {activity.title}
          </h3>
          <p className="text-xs text-slate-500">{activity.duration}</p>
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

      {(onSave || onRemove) && (
        <div className="mt-4 flex items-center justify-between no-print">
          {savedAt && (
            <span className="text-xs text-slate-500">
              保存日: {new Date(savedAt).toLocaleDateString("ja-JP")}
            </span>
          )}
          {onSave && (
            <button
              onClick={onSave}
              className="ml-auto rounded border border-primary-600 px-3 py-1.5 text-sm text-primary-700 hover:bg-primary-50"
            >
              お気に入りに保存
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="ml-auto rounded border border-red-400 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
            >
              削除
            </button>
          )}
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
