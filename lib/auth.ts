import { cookies } from "next/headers";

export type AppSession = {
  userId: number;
  username: string;
  isAdmin: boolean;
  fullName?: string;
  email?: string;
};

export async function getCurrentSession(): Promise<AppSession | null> {
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
