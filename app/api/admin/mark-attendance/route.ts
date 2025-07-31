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

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bookingId, attended, notes } = await request.json()

    if (!bookingId || typeof attended !== "boolean") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = dbOperations.markAttendance(bookingId, attended, notes)

    if (result.changes > 0) {
      return NextResponse.json({ success: true, message: "Attendance marked successfully" })
    } else {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error marking attendance:", error)
    return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 })
  }
}
