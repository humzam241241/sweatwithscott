import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "@/lib/z";
import { dbOperations } from "@/lib/database";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = (dbOperations as any).getDmFollowupQueue?.() ?? [];
  return NextResponse.json(rows);
}

const patchSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(["pending", "sent", "skipped"]),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }
  (dbOperations as any).updateDmFollowupStatus?.(parsed.data.id, parsed.data.status);
  return NextResponse.json({ success: true });
}
