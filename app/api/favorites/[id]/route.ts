import { NextResponse } from "next/server";
import { favoritesRepo } from "../../../lib/repositories";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  favoritesRepo.delete(params.id);
  return NextResponse.json({ ok: true });
}
