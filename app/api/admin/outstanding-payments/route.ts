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

    const outstandingPayments = dbOperations.getOutstandingPayments()
    return NextResponse.json(outstandingPayments)
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error fetching outstanding payments:", error)
    return NextResponse.json({ error: "Failed to fetch outstanding payments" }, { status: 500 })
  }
}
