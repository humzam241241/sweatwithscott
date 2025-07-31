import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      // Return mock data if no user ID (for demo purposes)
      const mockBookings = [
        {
          id: 1,
          className: "Boxing Fundamentals",
          date: "2024-01-25",
          time: "09:00 - 10:00",
          coach: "Coach Humza",
          attended: true,
          status: "confirmed",
          level: "All Levels",
        },
        {
          id: 2,
          className: "Advanced Boxing",
          date: "2024-01-26",
          time: "10:30 - 11:30",
          coach: "Coach Kyle",
          attended: false,
          status: "confirmed",
          level: "Advanced",
        },
        {
          id: 3,
          className: "Strength Training",
          date: "2024-01-27",
          time: "14:00 - 15:00",
          coach: "Coach Scott",
          attended: true,
          status: "confirmed",
          level: "Intermediate",
        },
        {
          id: 4,
          className: "Women's Boxing",
          date: "2024-01-28",
          time: "19:00 - 20:00",
          coach: "Coach Scott",
          attended: false,
          status: "confirmed",
          level: "All Levels",
        },
        {
          id: 5,
          className: "Boxing Bootcamp",
          date: "2024-01-29",
          time: "06:00 - 07:00",
          coach: "Coach Scott",
          attended: true,
          status: "confirmed",
          level: "All Levels",
        },
      ]
      return NextResponse.json(mockBookings)
    }

    // Get user bookings from database
    const bookings = dbOperations.getUserBookings(Number.parseInt(userId))

    // Transform to match frontend interface
    const transformedBookings = bookings.map((booking) => ({
      id: booking.id,
      className: booking.class_name,
      date: booking.date,
      time: `${booking.start_time} - ${booking.end_time}`,
      coach: booking.coach,
      attended: booking.attendance_status === "attended",
      status: booking.booking_status,
      level: booking.level,
      classInstanceId: booking.class_instance_id,
    }))

    return NextResponse.json(transformedBookings)
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}
