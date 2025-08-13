import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { dbOperations } from "@/lib/database";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

// Return a legacy-compatible shape so existing pages keep working
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const nextAuthSession = (await getServerSession(authOptions as any)) as any;

    const user = nextAuthSession?.user as any | undefined;
    if (user) {
      // Map OAuth user to numeric SQLite id for legacy routes
      const email = String(user.email || "").toLowerCase();
      const name = String(user.name || email || "user");
      let sqliteUser = email ? dbOperations.getUserByEmail(email) : undefined;
      if (!sqliteUser && email) {
        try {
          const hashed = bcrypt.hashSync("oauth-login", 10);
          const info = dbOperations.createUser({ username: email, password: hashed, email, fullName: name });
          sqliteUser = dbOperations.getUserById(Number(info.lastInsertRowid));
        } catch {
          sqliteUser = dbOperations.getUserByEmail(email);
        }
      }
      const legacy = {
        userId: Number(sqliteUser?.id ?? 0) || 0,
        username: email || name || "user",
        isAdmin: Boolean(user.isAdmin),
        fullName: name || undefined,
        email: email || undefined,
        role: Boolean(user.isAdmin) ? "admin" : "member",
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
