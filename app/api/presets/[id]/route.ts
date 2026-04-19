import { NextResponse } from "next/server";
import { presetsRepo } from "../../../lib/repositories";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  presetsRepo.delete(params.id);
  return NextResponse.json({ ok: true });
}
