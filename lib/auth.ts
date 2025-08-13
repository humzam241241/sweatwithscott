import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import { dbOperations } from "./database";
import bcrypt from "bcryptjs";

export type AppSession = {
  userId: number;
  username: string;
  isAdmin: boolean;
  fullName?: string;
  email?: string;
};

export async function getCurrentSession(): Promise<AppSession | null> {
  // Prefer NextAuth session if available
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    const user = session?.user as any;
    if (user) {
      // Map NextAuth user to legacy SQLite numeric user id
      const email = String(user.email || "").toLowerCase();
      const name = String(user.name || email || "user");
      let sqliteUser = email ? dbOperations.getUserByEmail(email) : undefined;
      if (!sqliteUser && email) {
        // Create a companion user row for OAuth logins
        try {
          const hashed = bcrypt.hashSync("oauth-login", 10);
          const info = dbOperations.createUser({ username: email, password: hashed, email, fullName: name });
          sqliteUser = dbOperations.getUserById(Number(info.lastInsertRowid));
        } catch {
          // ignore if race
          sqliteUser = dbOperations.getUserByEmail(email);
        }
      }
      const userId = Number(sqliteUser?.id ?? 0) || 0;
      return {
        userId,
        username: email || name || "user",
        isAdmin: Boolean(user.isAdmin),
        email: email || undefined,
        fullName: name || undefined,
      };
    }
  } catch {}
  // Fallback to legacy cookie session for compatibility
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;
  try {
    const parsed = JSON.parse(sessionCookie.value) as Partial<AppSession>;
    if (
      typeof parsed.userId === "number" &&
      typeof parsed.username === "string" &&
      typeof parsed.isAdmin === "boolean"
    ) {
      return parsed as AppSession;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUserId(): Promise<number | null> {
  const session = await getCurrentSession();
  return session?.userId ?? null;
}
