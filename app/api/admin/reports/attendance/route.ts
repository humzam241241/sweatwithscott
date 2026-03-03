import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/database";

async function isAdmin() {
  const store = await cookies();
  const c = store.get("session");
  if (!c) return false;
  try { return Boolean(JSON.parse(c.value)?.isAdmin); } catch { return false; }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') || new Date().toISOString().split('T')[0];
  const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

  const rows = db.prepare(`
    SELECT cb.id as booking_id, u.username, u.full_name, u.email, ci.date, ci.start_time, ci.end_time, c.name as class_name,
           cb.attended, cb.payment_status
    FROM class_bookings cb
    JOIN users u ON u.id = cb.user_id
    JOIN class_instances ci ON ci.id = cb.class_instance_id
    JOIN classes c ON c.id = ci.class_id
    WHERE ci.date BETWEEN ? AND ?
    ORDER BY ci.date ASC, ci.start_time ASC
  `).all(from, to) as any[];

  const header = ['booking_id','username','full_name','email','date','start_time','end_time','class_name','attended','payment_status'];
  const csv = [header.join(',')].concat(rows.map(r => header.map(h => JSON.stringify(r[h] ?? '')).join(','))).join('\n');
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="attendance_${from}_${to}.csv"` } });
}


