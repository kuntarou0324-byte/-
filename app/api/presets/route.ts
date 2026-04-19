import { NextRequest, NextResponse } from "next/server";
import { presetsRepo } from "../../lib/repositories";
import type { FormState } from "../../types";

export const runtime = "nodejs";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET() {
  return NextResponse.json({ items: presetsRepo.list() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const form = body.form as FormState | undefined;
  if (!name || !form) {
    return NextResponse.json({ error: "name and form are required" }, { status: 400 });
  }
  const preset = {
    id: makeId(),
    name,
    form,
    createdAt: new Date().toISOString(),
  };
  presetsRepo.insert(preset);
  return NextResponse.json({ ok: true, preset });
}
