import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"
import { sendMail } from "@/lib/utils"

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

    // Promote first waitlisted user if any
    const promoted = dbOperations.promoteWaitlistedUser(class_instance_id)
    if (promoted) {
      console.log(`Promoted waitlisted user ${promoted} to confirmed for class ${class_instance_id}`)
    }

    try {
      const u = dbOperations.getUserById(user_id) as any;
      if (u?.email && (u.email_opt_in ?? 1)) {
        await sendMail({ to: u.email, subject: "Cave Boxing – Booking cancelled", text: `Your booking for class ${class_instance_id} has been cancelled.` })
      }
    } catch {}

    return NextResponse.json({
      message:
        "Booking cancelled successfully. If you cancelled within the policy timeframe, any applicable refund will be processed.",
      status: "cancelled",
    })
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Cancellation error:", error)
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 })
  }
}
