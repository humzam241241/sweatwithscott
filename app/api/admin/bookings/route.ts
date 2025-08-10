import { type NextRequest, NextResponse } from "next/server"
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

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all bookings from both new and legacy systems
    const newBookings = dbOperations.getAllBookings()
    const legacyBookings = dbOperations.getLegacyBookings()

    // Combine and format bookings
    const allBookings = [
      ...newBookings.map((booking) => ({
        id: booking.id,
        userId: booking.user_id,
        username: booking.username,
        fullName: booking.full_name,
        className: booking.class_name,
        instructor: booking.instructor,
        date: booking.date,
        time: booking.start_time,
        endTime: booking.end_time,
        status: booking.status,
        paymentStatus: booking.payment_status,
        attended: booking.attended,
        bookingDate: booking.booking_date,
        type: "new",
      })),
      ...legacyBookings.map((booking) => ({
        id: booking.id,
        userId: booking.user_id,
        username: booking.username,
        fullName: booking.full_name,
        className: booking.class_name,
        instructor: "N/A",
        date: booking.class_date,
        time: booking.class_time,
        endTime: null,
        status: booking.status,
        paymentStatus: "unknown",
        attended: 0,
        bookingDate: booking.created_at,
        type: "legacy",
      })),
    ]

    // Sort by date and time
    allBookings.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`)
      const dateB = new Date(`${b.date} ${b.time}`)
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json({ bookings: allBookings })
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error fetching admin bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, bookingId, userId, classInstanceId } = await request.json()

    switch (action) {
      case "cancel":
        if (bookingId) {
          // Cancel existing booking
          const result = dbOperations.cancelBooking(userId, classInstanceId)
          return NextResponse.json({ success: true, result })
        }
        break

      case "mark_attendance":
        if (bookingId && typeof userId === "number" && typeof classInstanceId === "number") {
          const { attended } = await request.json()
          const result = dbOperations.markAttendance(userId, classInstanceId, attended)
          return NextResponse.json({ success: true, result })
        }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error processing admin booking action:", error)
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 })
  }
}
