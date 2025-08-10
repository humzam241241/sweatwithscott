import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"
import { isMembershipActiveForUserId } from "@/lib/memberships"

// Mock booking storage - in production, this would be in the database
const bookings = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const { user_id, class_instance_id, payment_method = "drop_in" } = await request.json()

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

    // Require active membership or drop-in payment intent
    const hasActive = isMembershipActiveForUserId(user_id, { graceDays: 7 })
    const isDropIn = String(payment_method).toLowerCase() === "drop_in"
    if (!hasActive && !isDropIn) {
      return NextResponse.json(
        { error: "Requires active membership or purchase a drop-in" },
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

    // Create the booking
    const bookingId = dbOperations.bookClass(user_id, class_instance_id)

    // In production, you would also:
    // 1. Process payment
    // 2. Send confirmation email
    // 3. Update member statistics

    return NextResponse.json({
      message: "Class booked successfully! You'll receive a confirmation email shortly.",
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
