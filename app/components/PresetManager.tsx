"use client";

import { useState } from "react";
import type { FormState } from "../types";

export type Preset = {
  id: string;
  name: string;
  form: FormState;
};

type Props = {
  presets: Preset[];
  currentForm: FormState;
  onApply: (form: FormState) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
};

export function PresetManager({
  presets,
  onApply,
  onSave,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setName("");
  };

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 no-print">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">
            条件プリセット
          </span>
          <span className="text-xs text-slate-500">
            ({presets.length}件保存中)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="text-xs text-primary-700 underline hover:text-primary-900"
        >
          {open ? "閉じる" : "開く"}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="プリセット名 (例: 午前グループ)"
              className="flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim()}
              className="rounded bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              現在の条件を保存
            </button>
          </div>

          {presets.length === 0 ? (
            <p className="text-xs text-slate-500">
              よく使う条件セットに名前をつけて保存できます。
            </p>
          ) : (
            <ul className="space-y-1.5">
              {presets.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-800">
                      {p.name}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      {p.form.participants} / {p.form.level} / {p.form.duration}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onApply(p.form)}
                    className="rounded bg-primary-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-primary-700"
                  >
                    適用
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`「${p.name}」を削除しますか?`)) {
                        onDelete(p.id);
                      }
                    }}
                    className="rounded border border-red-300 px-2.5 py-1 text-xs text-red-700 hover:bg-red-50"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
