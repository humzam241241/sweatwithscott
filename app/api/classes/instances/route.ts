<<<<<<< HEAD
// app/api/classes/instances/route.ts

import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

// Path to your SQLite database in project root
const dbPath = path.join(process.cwd(), "gym.db");
const db = new Database(dbPath);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const userId = searchParams.get("user_id") ? Number(searchParams.get("user_id")) : undefined;
=======
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
>>>>>>> ea2a8739ecf0ae94551f5d9a0d00496e913c3ad4

    // ✅ Validate required params
    if (!startDate || !endDate) {
<<<<<<< HEAD
      return NextResponse.json(
        { error: "Missing required start_date or end_date" },
        { status: 400 }
      );
    }

    let sql = `
      SELECT ci.id, ci.class_id, c.name, c.coach, ci.date, ci.start_time, ci.end_time, 
             ci.level, ci.max_capacity, ci.current_bookings, ci.price, ci.status
      FROM class_instances ci
      JOIN classes c ON ci.class_id = c.id
      WHERE date BETWEEN ? AND ?
    `;

    const params: (string | number)[] = [startDate, endDate];

    // If userId is provided, optionally filter or join with bookings table
    if (userId) {
      sql += `
        AND ci.id IN (
          SELECT class_instance_id 
          FROM bookings 
          WHERE user_id = ?
        )
      `;
      params.push(userId);
    }

    const rows = db.prepare(sql).all(...params);

    // ✅ Always return an array
    if (!Array.isArray(rows)) {
      console.error("❌ Query did not return an array:", rows);
      return NextResponse.json([]);
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error("❌ Error fetching class instances:", error);
    return NextResponse.json([], { status: 500 });
=======
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
  } catch (error) {
    console.error("Error fetching class schedule:", error)
    return NextResponse.json([])
>>>>>>> ea2a8739ecf0ae94551f5d9a0d00496e913c3ad4
  }
}
