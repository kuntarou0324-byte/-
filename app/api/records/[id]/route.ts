import { NextResponse } from "next/server";
import { recordsRepo } from "../../../lib/repositories";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  recordsRepo.delete(params.id);
  return NextResponse.json({ ok: true });
}
