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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const classInstanceId = Number.parseInt(params.id)
    if (isNaN(classInstanceId)) {
      return NextResponse.json({ error: "Invalid class ID" }, { status: 400 })
    }

    const attendees = dbOperations.getClassWithAttendees(classInstanceId)
    return NextResponse.json(attendees)
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error fetching class attendees:", error)
    return NextResponse.json({ error: "Failed to fetch class attendees" }, { status: 500 })
  }
}
