import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { addDays, format } from "date-fns"

// Return class schedule between start_date and end_date.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let startDate = searchParams.get("start_date")
    let endDate = searchParams.get("end_date")
    const userIdParam = searchParams.get("user_id")
    const userId = userIdParam ? Number.parseInt(userIdParam) : undefined

    if (!startDate || !endDate) {
      const now = new Date()
      startDate = format(now, "yyyy-MM-dd")
      endDate = format(addDays(now, 7), "yyyy-MM-dd")
    }

    const db = getDb()

    const params: any[] = [startDate, endDate]
    let query = `
      SELECT
        ci.id,
        ci.class_id,
        c.name AS name,
        c.instructor AS coach,
        ci.date,
        ci.start_time,
        ci.end_time,
        IFNULL(c.level, 'All Levels') AS level,
        ci.max_capacity,
        ci.current_bookings,
        c.price,
        ci.status
      FROM class_instances ci
      JOIN classes c ON ci.class_id = c.id
      WHERE ci.date BETWEEN ? AND ?`

    if (userId !== undefined) {
      query += ` AND EXISTS (SELECT 1 FROM class_bookings cb WHERE cb.user_id = ? AND cb.class_instance_id = ci.id)`
      params.push(userId)
    }

    query += ` ORDER BY ci.date, ci.start_time`

    const instances = db.prepare(query).all(...params)

    if (userId !== undefined) {
      const bookingStmt = db.prepare(
        `SELECT status FROM class_bookings WHERE user_id = ? AND class_instance_id = ? LIMIT 1`
      )
      for (const instance of instances) {
        const booking = bookingStmt.get(userId, instance.id) as { status: string } | undefined
        instance.user_booking_status = booking?.status
      }
    }

    return NextResponse.json(instances)
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error fetching class schedule:", error)
    return NextResponse.json([])
  }
}
