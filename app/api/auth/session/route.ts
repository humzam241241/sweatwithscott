import { NextResponse } from "next/server"
import { cookies } from "next/headers"

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

export async function GET(): Promise<
  NextResponse<LoggedInResponse | LoggedOutResponse>
> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ isLoggedIn: false })
    }

    try {
      const parsed = JSON.parse(sessionCookie.value) as {
        username?: unknown
        email?: unknown
        isAdmin?: unknown
      }

      if (
        typeof parsed.username === "string" &&
        typeof parsed.isAdmin === "boolean"
      ) {
        const user: LoggedInResponse["user"] = {
          username: parsed.username,
          isAdmin: parsed.isAdmin,
        }

        if (typeof parsed.email === "string") {
          user.email = parsed.email
        }

        return NextResponse.json({
          isLoggedIn: true,
          user,
        })
      }
    } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
      console.error("Invalid session cookie:", error)
    }

    return NextResponse.json({ isLoggedIn: false })
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Failed to read session cookie:", error)
    return NextResponse.json({ isLoggedIn: false })
  }
}

