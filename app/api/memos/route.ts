import { NextRequest, NextResponse } from "next/server";
import { dayMemosRepo } from "../../lib/repositories";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") ?? undefined;
  const to = req.nextUrl.searchParams.get("to") ?? undefined;
  return NextResponse.json({ items: dayMemosRepo.list(from, to) });
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  const { date, memo } = body as { date?: string; memo?: string };
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || typeof memo !== "string") {
    return NextResponse.json({ error: "invalid fields" }, { status: 400 });
  }
  const result = dayMemosRepo.upsert(date, memo);
  return NextResponse.json({ ok: true, memo: result });
}
