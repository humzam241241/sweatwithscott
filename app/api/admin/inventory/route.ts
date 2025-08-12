import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { z } from "@/lib/z";
import { dbOperations } from "@/lib/database";

async function requireAdmin() {
  // Try NextAuth session first
  try {
    const session = await getServerSession(authOptions as any);
    if (session?.user && (session.user as any).isAdmin) return session.user;
  } catch {}
  // Fallback to legacy cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;
  try {
    const s = JSON.parse(sessionCookie.value);
    return s?.isAdmin ? s : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ items: dbOperations.getInventory(), lowStock: dbOperations.getInventoryLowStock() });
}

const upsertSchema = z.object({
  id: z.number().int().optional(),
  sku: z.string().optional(),
  name: z.string().min(1),
  category: z.string().optional(),
  price: z.number().nonnegative().optional(),
  quantity: z.number().int().optional(),
  min_threshold: z.number().int().nonnegative().optional(),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await req.json();
  const parsed = upsertSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  const { id } = dbOperations.upsertInventoryItem(parsed.data);
  return NextResponse.json({ id }, { status: 201 });
}

const moveSchema = z.object({ item_id: z.number().int(), delta: z.number().int(), reason: z.string().optional() });

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await req.json();
  const parsed = moveSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  dbOperations.addInventoryMovement(parsed.data.item_id, parsed.data.delta, parsed.data.reason);
  return NextResponse.json({ success: true });
}


