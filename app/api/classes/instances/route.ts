import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"

// Mock data for class instances - in production, this would come from the database
const generateClassInstances = (startDate: string, endDate: string, userId?: number) => {
  const instances = [
    // Monday classes
    {
      id: 1,
      class_id: 1,
      name: "Boxing Technique",
      coach: "Kyle McLaughlin",
      date: "2024-02-05",
      start_time: "06:00",
      end_time: "07:00",
      level: "All Levels",
      max_capacity: 15,
      current_bookings: 8,
      price: 25.0,
      status: "active",
      user_booking_status: userId === 2 ? "confirmed" : undefined,
    },
    {
      id: 2,
      class_id: 2,
      name: "Strength & Conditioning",
      coach: "Humza Muhammad",
      date: "2024-02-05",
      start_time: "19:00",
      end_time: "20:00",
      level: "Intermediate",
      max_capacity: 12,
      current_bookings: 10,
      price: 25.0,
      status: "active",
    },
    // Tuesday classes
    {
      id: 3,
      class_id: 3,
      name: "Boxing Bootcamp",
      coach: "Scott McDonald",
      date: "2024-02-06",
      start_time: "06:00",
      end_time: "07:00",
      level: "All Levels",
      max_capacity: 20,
      current_bookings: 15,
      price: 25.0,
      status: "active",
    },
    {
      id: 4,
      class_id: 4,
      name: "Teen Boxing",
      coach: "Kyle McLaughlin",
      date: "2024-02-06",
      start_time: "16:00",
      end_time: "17:00",
      level: "Ages 13-16",
      max_capacity: 10,
      current_bookings: 6,
      price: 20.0,
      status: "active",
    },
    {
      id: 5,
      class_id: 5,
      name: "Women's Boxing",
      coach: "Scott McDonald",
      date: "2024-02-06",
      start_time: "19:00",
      end_time: "20:00",
      level: "All Levels",
      max_capacity: 15,
      current_bookings: 12,
      price: 25.0,
      status: "active",
      user_booking_status: userId === 3 ? "confirmed" : undefined,
    },
    // Wednesday classes
    {
      id: 6,
      class_id: 6,
      name: "Boxing Technique",
      coach: "Kyle McLaughlin",
      date: "2024-02-07",
      start_time: "06:00",
      end_time: "07:00",
      level: "All Levels",
      max_capacity: 15,
      current_bookings: 15,
      price: 25.0,
      status: "active",
    },
    {
      id: 7,
      class_id: 7,
      name: "Strength & Conditioning",
      coach: "Humza Muhammad",
      date: "2024-02-07",
      start_time: "19:00",
      end_time: "20:00",
      level: "Advanced",
      max_capacity: 12,
      current_bookings: 9,
      price: 25.0,
      status: "active",
    },
    // Thursday classes
    {
      id: 8,
      class_id: 8,
      name: "Boxing Bootcamp",
      coach: "Scott McDonald",
      date: "2024-02-08",
      start_time: "06:00",
      end_time: "07:00",
      level: "All Levels",
      max_capacity: 20,
      current_bookings: 18,
      price: 25.0,
      status: "active",
    },
    {
      id: 9,
      class_id: 9,
      name: "Teen Boxing",
      coach: "Kyle McLaughlin",
      date: "2024-02-08",
      start_time: "16:00",
      end_time: "17:00",
      level: "Ages 13-16",
      max_capacity: 10,
      current_bookings: 7,
      price: 20.0,
      status: "active",
    },
    {
      id: 10,
      class_id: 10,
      name: "Boxing Technique",
      coach: "Kyle McLaughlin",
      date: "2024-02-08",
      start_time: "19:00",
      end_time: "20:00",
      level: "Intermediate",
      max_capacity: 15,
      current_bookings: 11,
      price: 25.0,
      status: "active",
    },
    // Friday classes
    {
      id: 11,
      class_id: 11,
      name: "Boxing Technique",
      coach: "Kyle McLaughlin",
      date: "2024-02-09",
      start_time: "06:00",
      end_time: "07:00",
      level: "All Levels",
      max_capacity: 15,
      current_bookings: 13,
      price: 25.0,
      status: "active",
    },
    {
      id: 12,
      class_id: 12,
      name: "Open Gym",
      coach: "Self-Directed",
      date: "2024-02-09",
      start_time: "19:00",
      end_time: "20:00",
      level: "Members Only",
      max_capacity: 25,
      current_bookings: 8,
      price: 0.0,
      status: "active",
    },
    // Saturday classes
    {
      id: 13,
      class_id: 13,
      name: "Boxing Bootcamp",
      coach: "Scott McDonald",
      date: "2024-02-10",
      start_time: "09:00",
      end_time: "10:00",
      level: "All Levels",
      max_capacity: 20,
      current_bookings: 16,
      price: 25.0,
      status: "active",
    },
    {
      id: 14,
      class_id: 14,
      name: "Junior Jabbers",
      coach: "Humza Muhammad",
      date: "2024-02-10",
      start_time: "10:00",
      end_time: "11:00",
      level: "Ages 6-12",
      max_capacity: 12,
      current_bookings: 9,
      price: 15.0,
      status: "active",
    },
    {
      id: 15,
      class_id: 15,
      name: "Teen Boxing",
      coach: "Kyle McLaughlin",
      date: "2024-02-10",
      start_time: "11:30",
      end_time: "12:30",
      level: "Ages 13-16",
      max_capacity: 10,
      current_bookings: 8,
      price: 20.0,
      status: "active",
    },
    // Sunday classes
    {
      id: 16,
      class_id: 16,
      name: "Open Gym",
      coach: "Self-Directed",
      date: "2024-02-11",
      start_time: "10:00",
      end_time: "11:00",
      level: "Members Only",
      max_capacity: 25,
      current_bookings: 5,
      price: 0.0,
      status: "active",
    },
  ]

  return instances
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start_date") || ""
    const endDate = searchParams.get("end_date") || ""
    const userId = searchParams.get("user_id") ? Number.parseInt(searchParams.get("user_id")!) : undefined

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start date and end date are required" }, { status: 400 })
    }

    // Get class instances from database
    const instances = await dbOperations.getClassInstances(startDate, endDate)

    // If userId is provided, check user's booking status for each class
    const instancesWithBookingStatus = instances.map((instance) => {
      let userBookingStatus = undefined

      if (userId) {
        const userBooking = dbOperations.getUserBookingForClass(userId, instance.id)
        if (userBooking) {
          userBookingStatus = userBooking.booking_status
        }
      }

      return {
        id: instance.id,
        class_id: instance.class_id,
        name: instance.name,
        coach: instance.coach,
        date: instance.date,
        start_time: instance.start_time,
        end_time: instance.end_time,
        level: instance.level,
        max_capacity: instance.max_capacity,
        current_bookings: instance.current_bookings,
        price: instance.price,
        status: instance.status,
        user_booking_status: userBookingStatus,
      }
    })

    return NextResponse.json(instancesWithBookingStatus)
  } catch (error) {
    console.error("Error fetching class instances:", error)
    return NextResponse.json({ error: "Failed to fetch class instances" }, { status: 500 })
  }
}
