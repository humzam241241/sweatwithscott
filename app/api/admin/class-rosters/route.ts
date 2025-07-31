import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"

// Mock roster data - in production, this would come from the database
const generateClassRosters = () => {
  return [
    {
      id: 1,
      class_name: "Boxing Technique",
      coach: "Kyle McLaughlin",
      date: "2024-02-05",
      start_time: "06:00",
      end_time: "07:00",
      max_capacity: 15,
      current_bookings: 8,
      attendees: [
        {
          id: 1,
          user_id: 2,
          name: "John Doe",
          email: "john@example.com",
          phone: "(555) 123-4567",
          booking_status: "confirmed",
          payment_status: "paid",
          payment_method: "monthly",
          booking_date: "2024-02-01T10:30:00Z",
          attendance_status: null,
          notes: "",
        },
        {
          id: 2,
          user_id: 3,
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "(555) 234-5678",
          booking_status: "confirmed",
          payment_status: "paid",
          payment_method: "annual",
          booking_date: "2024-02-02T14:15:00Z",
          attendance_status: null,
          notes: "",
        },
        {
          id: 3,
          user_id: 4,
          name: "Mike Wilson",
          email: "mike@example.com",
          phone: "(555) 345-6789",
          booking_status: "confirmed",
          payment_status: "pending",
          payment_method: "drop_in",
          booking_date: "2024-02-03T09:45:00Z",
          attendance_status: null,
          notes: "First time visitor",
        },
      ],
      waitlist: [
        {
          id: 4,
          user_id: 5,
          name: "Sarah Johnson",
          email: "sarah@example.com",
          phone: "(555) 456-7890",
          position: 1,
          created_at: "2024-02-04T16:20:00Z",
        },
      ],
    },
    {
      id: 5,
      class_name: "Women's Boxing",
      coach: "Scott McDonald",
      date: "2024-02-06",
      start_time: "19:00",
      end_time: "20:00",
      max_capacity: 15,
      current_bookings: 12,
      attendees: [
        {
          id: 5,
          user_id: 6,
          name: "Emma Rodriguez",
          email: "emma@example.com",
          phone: "(555) 567-8901",
          booking_status: "confirmed",
          payment_status: "paid",
          payment_method: "monthly",
          booking_date: "2024-02-01T11:00:00Z",
          attendance_status: null,
          notes: "",
        },
        {
          id: 6,
          user_id: 7,
          name: "Lisa Chen",
          email: "lisa@example.com",
          phone: "(555) 678-9012",
          booking_status: "confirmed",
          payment_status: "paid",
          payment_method: "drop_in",
          booking_date: "2024-02-03T15:30:00Z",
          attendance_status: null,
          notes: "Returning after injury",
        },
      ],
      waitlist: [],
    },
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const classInstanceId = searchParams.get("class_instance_id")

    if (classInstanceId) {
      // Get specific class roster
      const roster = dbOperations.getClassRoster(Number.parseInt(classInstanceId))
      return NextResponse.json(roster)
    }

    if (date) {
      // Get all class rosters for a specific date
      const rosters = dbOperations.getClassRostersByDate(date)

      // Get detailed roster for each class
      const detailedRosters = rosters.map((roster) => {
        const attendees = dbOperations.getClassRoster(roster.class_instance_id)
        return {
          id: roster.class_instance_id,
          class_name: roster.class_name,
          coach: roster.coach,
          date: roster.date,
          start_time: roster.start_time,
          end_time: roster.end_time,
          max_capacity: roster.max_capacity,
          current_bookings: roster.current_bookings,
          attendees: attendees.map((attendee) => ({
            id: attendee.id,
            user_id: attendee.user_id,
            name: attendee.username,
            email: attendee.email || `${attendee.username}@example.com`,
            phone: attendee.phone || "(555) 000-0000",
            booking_status: attendee.booking_status,
            payment_status: attendee.payment_status,
            payment_method: attendee.payment_method,
            booking_date: attendee.booking_date,
            attendance_status: attendee.attendance_status,
            notes: attendee.notes || "",
          })),
          waitlist: [], // TODO: Implement waitlist
        }
      })

      return NextResponse.json(detailedRosters)
    }

    return NextResponse.json({ error: "Date or class_instance_id parameter required" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching class rosters:", error)
    return NextResponse.json({ error: "Failed to fetch class rosters" }, { status: 500 })
  }
}
