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
        COALESCE(c.instructor, c.coach_name, '') AS coach,
        ci.date,
        ci.start_time,
        ci.end_time,
        'All Levels' AS level,
        ci.max_capacity,
        ci.current_bookings,
        c.price,
        c.color,
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
      // Optional: include user booking status if user_id provided
      let bookingForUser: ((instanceId: number) => string | undefined) | null = null
      if (userId !== undefined) {
        const bookingStmt = db.prepare(
          `SELECT status FROM class_bookings WHERE user_id = ? AND class_instance_id = ? LIMIT 1`
        )
        bookingForUser = (instanceId: number) => {
          const b = bookingStmt.get(userId, instanceId) as { status: string } | undefined
          return b?.status
        }
      }

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
          user_booking_status: bookingForUser ? bookingForUser(row.id) : undefined,
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
  // Accept flexible datetime strings (e.g., from <input type="datetime-local">)
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  capacity: z.number().int().positive().optional(),
  color: z.string().optional(),
  coachName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const db = getDb()
    const json = await request.json()
    const parsed = createSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 })
    }
    const { classId, title, startsAt, endsAt, capacity, color, coachName } = parsed.data

    let effectiveClassId = classId
    if (!effectiveClassId) {
      if (!title) return NextResponse.json({ error: "title or classId required" }, { status: 400 })
      const existing = db.prepare(`SELECT id FROM classes WHERE name = ? LIMIT 1`).get(title) as { id: number } | undefined
      if (existing) {
        effectiveClassId = existing.id
      } else {
        const info = db.prepare(
          `INSERT INTO classes (name, description, instructor, duration, max_capacity, price, day_of_week, start_time, end_time, is_active, slug, coach_id, coach_name, active, image, color)
           VALUES (?, '', ?, 60, ?, 0, ?, ?, ?, 1, LOWER(REPLACE(?, ' ', '-')), NULL, ?, 1, NULL, ?)`
        ).run(title, coachName ?? '', capacity ?? 20, null, null, null, title, coachName ?? '', color ?? null)
        effectiveClassId = Number(info.lastInsertRowid)
      }
    }

    // Update class attributes if provided
    if (color || coachName) {
      const updates: string[] = []
      const values: any[] = []
      if (color) { updates.push('color = ?'); values.push(color) }
      if (coachName) { updates.push('instructor = ?'); values.push(coachName) }
      if (updates.length) {
        db.prepare(`UPDATE classes SET ${updates.join(', ')} WHERE id = ?`).run(...values, effectiveClassId)
      }
    }

    // Interpret incoming ISO-like strings as local times if missing timezone
    const parseLocal = (iso: string) => {
      // If it already has a timezone/Z, let Date parse it as-is
      if (/Z|[+-]\d{2}:?\d{2}$/.test(iso)) return new Date(iso)
      // Treat as local wall time
      const [datePart, timePart] = iso.split("T")
      const [y, m, d] = datePart.split("-").map((n) => Number(n))
      const [hh, mm = "0"] = (timePart || "00:00").split(":")
      const dt = new Date(y, (m ?? 1) - 1, d ?? 1, Number(hh), Number(mm))
      return dt
    }

    const start = parseLocal(startsAt)
    const end = parseLocal(endsAt)
    if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
      return NextResponse.json({ error: `Invalid startsAt/endsAt. startsAt='${startsAt}', endsAt='${endsAt}'` }, { status: 400 })
    }
    const pad = (n: number) => String(n).padStart(2, "0")
    const date = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`
    const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`
    const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`

    const info = db
      .prepare(
        `INSERT INTO class_instances (class_id, date, start_time, end_time, instructor, max_capacity, current_bookings, status)
         VALUES (?, ?, ?, ?, COALESCE((SELECT instructor FROM classes WHERE id = ?), ''), ?, 0, 'scheduled')`
      )
      .run(effectiveClassId, date, startTime, endTime, effectiveClassId, capacity ?? 20)

    if (color) {
      db.prepare(`UPDATE classes SET color = ? WHERE id = ?`).run(color, effectiveClassId)
    }

    // Respond with the created instance in admin event shape for immediate UI updates
    const cls = db.prepare(`SELECT name, color, instructor, max_capacity FROM classes WHERE id = ?`).get(effectiveClassId) as { name: string; color?: string | null; instructor?: string | null; max_capacity?: number | null } | undefined
    const createdEvent = {
      id: Number(info.lastInsertRowid),
      title: title ?? cls?.name ?? 'Class',
      startsAt: `${date}T${startTime}:00`,
      endsAt: `${date}T${endTime}:00`,
      coach: { id: null, name: cls?.instructor ?? coachName ?? '' },
      capacity: capacity ?? cls?.max_capacity ?? 20,
      bookedCount: 0,
      color: color ?? (cls?.color ?? undefined),
      status: 'scheduled',
    }
    return NextResponse.json(createdEvent, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
