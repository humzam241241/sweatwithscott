import { NextResponse } from "next/server";
import { z } from "@/lib/z";
import { dbOperations } from "@/lib/database";

const bodySchema = z.object({
  fullName: z.string().max(120).optional(),
  instagramHandle: z.string().max(80).optional(),
  email: z.string().email().optional().or(z.literal("")),
  interest: z.string().max(300).optional(),
});

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    const { fullName, instagramHandle, email, interest } = parsed.data;
    const lead = (dbOperations as any).insertInstagramLead?.({
      fullName,
      instagramHandle,
      email: email || undefined,
      interest,
      source: "instagram",
    });
    (dbOperations as any).createDmFollowupTask?.({
      leadId: lead?.id,
      recipientHandle: instagramHandle,
      messageTemplate: "Hey! Thanks for checking out Sweat with Scott. Want help choosing 8-week reset vs daily plan?",
      platform: "instagram",
      status: "pending",
    });

    return NextResponse.json({ success: true, id: lead?.id ?? null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to save lead", message }, { status: 500 });
  }
}
