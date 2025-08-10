import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { addDays, format } from "date-fns"
import { z } from "@/lib/z"

// Return class schedule between start_date and end_date.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // Back-compat params
    let startDate = searchParams.get("start_date")
    let endDate = searchParams.get("end_date")
    // New params per Admin Schedule API
    const fromISO = searchParams.get("from")
    const toISO = searchParams.get("to")
    const userIdParam = searchParams.get("user_id")
    const userId = userIdParam ? Number.parseInt(userIdParam) : undefined

    if (fromISO && toISO) {
      // Prefer new params if provided
      const from = new Date(fromISO)
      const to = new Date(toISO)
      if (Number.isNaN(from.valueOf()) || Number.isNaN(to.valueOf())) {
        return NextResponse.json({ error: "Invalid 'from' or 'to'" }, { status: 400 })
      }
      const pad = (n: number) => String(n).padStart(2, "0")
      const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      startDate = ymd(from)
      endDate = ymd(to)
    }

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

    const instances = db.prepare(query).all(...params) as any[]

    // If new params were used, return admin event shape
    if (fromISO && toISO) {
      const result = instances.map((row) => {
        const startsAt = `${row.date}T${row.start_time}:00`
        const endsAt = `${row.date}T${row.end_time}:00`
        return {
          id: row.id,
          title: row.name,
          startsAt,
          endsAt,
          coach: { id: null, name: row.coach ?? "" },
          capacity: row.max_capacity,
          bookedCount: row.current_bookings,
          color: row.color ?? undefined,
          status: row.status,
        }
      })
      return NextResponse.json(result)
    }

    // Back-compat shape
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

const createSchema = z.object({
  classId: z.number().int().optional(),
  title: z.string().min(1).optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  capacity: z.number().int().positive().optional(),
  color: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const db = getDb()
    const json = await request.json()
    const parsed = createSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 })
    }
    const { classId, title, startsAt, endsAt, capacity, color } = parsed.data

    let effectiveClassId = classId
    if (!effectiveClassId) {
      if (!title) return NextResponse.json({ error: "title or classId required" }, { status: 400 })
      const existing = db.prepare(`SELECT id FROM classes WHERE name = ? LIMIT 1`).get(title) as { id: number } | undefined
      if (existing) {
        effectiveClassId = existing.id
      } else {
        const info = db.prepare(
          `INSERT INTO classes (name, description, instructor, duration, max_capacity, price, day_of_week, start_time, end_time, is_active, slug, coach_id, coach_name, active, image, color)
           VALUES (?, '', '', 60, ?, 0, NULL, NULL, NULL, 1, LOWER(REPLACE(?, ' ', '-')), NULL, '', 1, NULL, ?)`
        ).run(title, capacity ?? 20, title, color ?? null)
        effectiveClassId = Number(info.lastInsertRowid)
      }
    }

    const start = new Date(startsAt)
    const end = new Date(endsAt)
    if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
      return NextResponse.json({ error: "Invalid startsAt/endsAt" }, { status: 400 })
    }
    const pad = (n: number) => String(n).padStart(2, "0")
    const date = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`
    const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`
    const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`

    const info = db
      .prepare(
        `INSERT INTO class_instances (class_id, date, start_time, end_time, instructor, max_capacity, current_bookings, status)
         VALUES (?, ?, ?, ?, '', ?, 0, 'scheduled')`
      )
      .run(effectiveClassId, date, startTime, endTime, capacity ?? 20)

    if (color) {
      db.prepare(`UPDATE classes SET color = ? WHERE id = ?`).run(color, effectiveClassId)
    }

    return NextResponse.json({ id: Number(info.lastInsertRowid) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
