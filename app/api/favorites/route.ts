import { NextRequest, NextResponse } from "next/server";
import { favoritesRepo } from "../../lib/repositories";
import type { Activity, SavedActivity } from "../../types";

export const runtime = "nodejs";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toSaved(activity: Activity): SavedActivity {
  return {
    ...activity,
    id: makeId(),
    savedAt: new Date().toISOString(),
  };
}

export async function GET() {
  return NextResponse.json({ items: favoritesRepo.list() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  const activity = body.activity as Activity | undefined;
  if (!activity?.title) {
    return NextResponse.json({ error: "activity is required" }, { status: 400 });
  }
  if (favoritesRepo.existsByTitle(activity.title)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }
  const saved = toSaved(activity);
  favoritesRepo.insert(saved);
  return NextResponse.json({ ok: true, saved });
}
