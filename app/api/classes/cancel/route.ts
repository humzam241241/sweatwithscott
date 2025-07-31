import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { user_id, class_instance_id, reason } = await request.json()

    if (!user_id || !class_instance_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Cancel the booking
    const cancelled = dbOperations.cancelBooking(user_id, class_instance_id, reason)

    if (!cancelled) {
      return NextResponse.json({ error: "No confirmed booking found to cancel" }, { status: 404 })
    }

    // In production, you would also:
    // 1. Process refund if applicable
    // 2. Notify waitlisted users
    // 3. Send cancellation confirmation email

    return NextResponse.json({
      message:
        "Booking cancelled successfully. If you cancelled within the policy timeframe, any applicable refund will be processed.",
      status: "cancelled",
    })
  } catch (error) {
    console.error("Cancellation error:", error)
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 })
  }
}
