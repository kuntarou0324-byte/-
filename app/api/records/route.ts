import { NextRequest, NextResponse } from "next/server";
import { recordsRepo } from "../../lib/repositories";
import type { ExecutionRecord } from "../../types";

export const runtime = "nodejs";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const VALID_REACTIONS: ExecutionRecord["reaction"][] = ["好評", "普通", "反応薄い"];

export async function GET() {
  return NextResponse.json({ items: recordsRepo.list() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  const {
    activityTitle,
    activityCategory,
    date,
    participants,
    reaction,
    note,
  } = body as Partial<ExecutionRecord>;

  if (
    typeof activityTitle !== "string" ||
    typeof activityCategory !== "string" ||
    typeof date !== "string" ||
    typeof participants !== "number" ||
    !VALID_REACTIONS.includes(reaction as ExecutionRecord["reaction"]) ||
    typeof note !== "string"
  ) {
    return NextResponse.json({ error: "invalid fields" }, { status: 400 });
  }

  const record: ExecutionRecord = {
    id: makeId(),
    activityTitle,
    activityCategory,
    date,
    participants,
    reaction: reaction as ExecutionRecord["reaction"],
    note,
    createdAt: new Date().toISOString(),
  };
  recordsRepo.insert(record);
  return NextResponse.json({ ok: true, record });
}
