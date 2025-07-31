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

    // ✅ Validate required params
    if (!startDate || !endDate) {
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
  }
}
