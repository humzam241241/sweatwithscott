import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"
import { isMembershipActiveForUserId } from "@/lib/memberships"
import { sendMail } from "@/lib/utils"

// Mock booking storage - in production, this would be in the database
const bookings = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const { user_id, class_instance_id, payment_method } = await request.json()

    if (!user_id || !class_instance_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user exists
    const user = dbOperations.getUserById(user_id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if class instance exists
    const classInstance = dbOperations.getClassInstanceById(class_instance_id)
    if (!classInstance) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Require active membership OR a confirmed drop-in payment
    // Convention: client sets payment_method = "drop_in_paid" only AFTER successful Stripe checkout
    const hasActive = isMembershipActiveForUserId(user_id, { graceDays: 7 })
    const paidDropIn = String(payment_method || "").toLowerCase() === "drop_in_paid"
    if (!hasActive && !paidDropIn) {
      return NextResponse.json(
        { error: "Payment required. Complete drop-in checkout to confirm booking.", code: "PAYMENT_REQUIRED" },
        { status: 402 },
      )
    }

    // Check if user already has a booking for this class
    const existingBooking = dbOperations.getUserBookingForClass(user_id, class_instance_id)
    if (existingBooking) {
      return NextResponse.json({ error: "You already have a booking for this class" }, { status: 400 })
    }

    // Prevent double booking at the same time
    const overlap = dbOperations.getUserBookingOverlap(
      user_id,
      classInstance.date,
      classInstance.start_time,
      classInstance.end_time,
    )
    if (overlap) {
      return NextResponse.json(
        { error: "You already have another class booked at this time" },
        { status: 400 },
      )
    }

    // Check if class is full
    if (classInstance.current_bookings >= classInstance.max_capacity) {
      const result = dbOperations.waitlistClass(user_id, class_instance_id)
      return NextResponse.json({
        message: "Class is full. You've been added to the waitlist.",
        booking_id: result.lastInsertRowid,
        status: "waitlist",
      })
    }

    // Create the booking as confirmed (membership) or confirmed after paid drop-in
    const bookingId = dbOperations.bookClass(user_id, class_instance_id)

    // In production, you would also:
    // 1. Process payment
    // 2. Send confirmation email
    // 3. Update member statistics

    try {
      const u = dbOperations.getUserById(user_id) as any;
      if (u?.email && (u.email_opt_in ?? 1)) {
        await sendMail({
          to: u.email,
          subject: "Cave Boxing – Class booked",
          text: `You booked a class on ${classInstance.date} at ${classInstance.start_time}. If you need to cancel, visit your dashboard.`,
        });
      }
    } catch {}

    return NextResponse.json({
      message: "Class booked successfully!",
      booking_id: bookingId,
      status: "confirmed",
    })
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Failed to book class" }, { status: 500 })
  }
}
