import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { cookies } from "next/headers";

// Return a legacy-compatible shape so existing pages keep working
export async function GET() {
  try {
    const nextAuthSession = (await getServerSession(authOptions as any)) as any;

    const user = nextAuthSession?.user as any | undefined;
    if (user) {
      const legacy = {
        userId: Number(user.id ?? 0) || 0,
        username: (user.email as string) || (user.name as string) || "user",
        isAdmin: Boolean(user.isAdmin),
        fullName: (user.name as string) || undefined,
        email: (user.email as string) || undefined,
      };
      return NextResponse.json(legacy);
    }

    // Fallback: legacy cookie session
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("session");
      if (sessionCookie?.value) {
        const parsed = JSON.parse(sessionCookie.value);
        if (
          typeof parsed.userId === "number" &&
          typeof parsed.username === "string" &&
          typeof parsed.isAdmin === "boolean"
        ) {
          return NextResponse.json(parsed);
        }
      }
    } catch {}

    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
