import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { dbOperations } from "@/lib/database"

async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")

  if (!sessionCookie) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const session = await getSession()

    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentClasses = dbOperations.getCurrentClasses()
    return NextResponse.json(currentClasses)
  } catch (error) {
    console.error("Error fetching current classes:", error)
    return NextResponse.json({ error: "Failed to fetch current classes" }, { status: 500 })
  }
}
