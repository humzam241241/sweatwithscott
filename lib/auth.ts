import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

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
      return {
        userId: Number(user.id ?? 0) || 0,
        username: (user.email as string) || (user.name as string) || "user",
        isAdmin: Boolean(user.isAdmin),
        email: (user.email as string) || undefined,
        fullName: (user.name as string) || undefined,
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
