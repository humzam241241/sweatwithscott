import { NextRequest, NextResponse } from "next/server";
import { run } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const info = run("DELETE FROM classes WHERE id = ?", [params.id]);
    if (info.changes === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting class", err);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 },
    );
  }
}
