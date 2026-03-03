import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

interface LoggedInResponse {
  isLoggedIn: true
  user: {
    username: string
    email?: string
    isAdmin: boolean
  }
}

interface LoggedOutResponse {
  isLoggedIn: false
}

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<LoggedInResponse | LoggedOutResponse>> {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    const user = session?.user as any | undefined;

    if (!user) {
      return NextResponse.json({ isLoggedIn: false });
    }

    const payload: LoggedInResponse = {
      isLoggedIn: true,
      user: {
        username: (user.email as string) || (user.name as string) || "user",
        isAdmin: Boolean(user.isAdmin),
      },
    };
    if (user.email) payload.user.email = user.email as string;

    // Disable caching so client always sees fresh auth state
    return new NextResponse(JSON.stringify(payload), {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
    return NextResponse.json({ isLoggedIn: false });
  }
}

