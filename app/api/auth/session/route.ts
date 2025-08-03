import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { dbOperations } from "@/lib/database";

interface LoggedInResponse {
  isLoggedIn: true;
  user: {
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

interface LoggedOutResponse {
  isLoggedIn: false;
}

interface ErrorResponse {
  error: string;
}

export async function GET(_: NextRequest): Promise<NextResponse<LoggedInResponse | LoggedOutResponse | ErrorResponse>> {
  try {
    const session = await getServerSession();

    const userInfo = session?.user as
      | { username?: string | null; name?: string | null; email?: string | null }
      | undefined;

    const username = userInfo?.username || userInfo?.name;
    const email = userInfo?.email;

    if (!username || !email) {
      return NextResponse.json({ isLoggedIn: false });
    }

    const dbUser = dbOperations.getUserByUsername(username);
    const isAdmin = dbUser?.is_admin === 1;

    return NextResponse.json({
      isLoggedIn: true,
      user: {
        username,
        email,
        isAdmin,
      },
    });
  } catch (error) {
    console.error("Failed to fetch session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

