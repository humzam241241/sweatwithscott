import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { dbOperations } from "@/lib/database"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"

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
    // Prefer NextAuth
    const nextAuth = (await getServerSession(authOptions as any)) as any;
    const isAdmin = Boolean((nextAuth?.user as any)?.isAdmin);
    if (!isAdmin) {
      // Fallback to legacy cookie
      const legacy = await getSession();
      if (!legacy || !legacy.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { bookingId, paymentMethod } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: "Missing booking ID" }, { status: 400 })
    }

    dbOperations.markPaymentPaid(bookingId, paymentMethod || "cash")

    return NextResponse.json({ success: true, message: "Payment marked as paid successfully" })
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error marking payment as paid:", error)
    return NextResponse.json({ error: "Failed to mark payment as paid" }, { status: 500 })
  }
}
