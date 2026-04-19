import { NextRequest, NextResponse } from "next/server";
import {
  favoritesRepo,
  presetsRepo,
  recordsRepo,
  type PresetRecord,
} from "../../lib/repositories";
import type { ExecutionRecord, FormState, SavedActivity } from "../../types";

export const runtime = "nodejs";

type Payload = {
  favorites?: SavedActivity[];
  presets?: { id: string; name: string; form: FormState }[];
  records?: ExecutionRecord[];
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Payload | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  let favCount = 0;
  let presetCount = 0;
  let recordCount = 0;

  for (const f of body.favorites ?? []) {
    if (!f?.title || favoritesRepo.existsByTitle(f.title)) continue;
    favoritesRepo.insert(f);
    favCount++;
  }

  for (const p of body.presets ?? []) {
    if (!p?.name || !p?.form) continue;
    const preset: PresetRecord = {
      id: p.id,
      name: p.name,
      form: p.form,
      createdAt: new Date().toISOString(),
    };
    presetsRepo.insert(preset);
    presetCount++;
  }

  for (const r of body.records ?? []) {
    if (!r?.id || !r?.activityTitle) continue;
    recordsRepo.insert(r);
    recordCount++;
  }

  return NextResponse.json({
    ok: true,
    imported: {
      favorites: favCount,
      presets: presetCount,
      records: recordCount,
    },
  });
}
