import { NextRequest, NextResponse } from "next/server";
import { dbOperations } from "@/lib/database";

// Unified bookings endpoint
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    if (userId) {
      const uid = Number(userId);
      if (!Number.isFinite(uid)) return NextResponse.json({ error: 'user_id must be number' }, { status: 400 });
      return NextResponse.json(dbOperations.getUserBookings(uid));
    }
    return NextResponse.json(dbOperations.getAllBookings());
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = Number(body.user_id);
    const classInstanceId = Number(body.class_instance_id);
    if (!Number.isFinite(userId) || !Number.isFinite(classInstanceId)) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }
    const existing = dbOperations.getUserBookingForClass(userId, classInstanceId);
    if (existing) return NextResponse.json({ error: 'Already booked' }, { status: 409 });
    const instance = dbOperations.getClassInstanceById(classInstanceId);
    if (!instance) return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    if (instance.current_bookings >= instance.max_capacity) {
      const result = dbOperations.waitlistClass(userId, classInstanceId);
      return NextResponse.json({ status: 'waitlist', booking_id: result.lastInsertRowid });
    }
    const bookingId = dbOperations.bookClass(userId, classInstanceId);
    return NextResponse.json({ status: 'confirmed', booking_id: bookingId });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
