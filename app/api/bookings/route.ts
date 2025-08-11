import { NextRequest, NextResponse } from "next/server";
import { dbOperations } from "@/lib/database";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = Number(url.searchParams.get('user_id'));
  if (!Number.isFinite(userId)) return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  const rows = dbOperations.getUserBookings(userId);
  return NextResponse.json(rows);
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
import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"

export async function GET() {
  try {
    const bookings = dbOperations.getAllBookings()
    return NextResponse.json(bookings)
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, class_type, date } = await request.json()

    dbOperations.createBooking(name, email, class_type, date)

    return NextResponse.json({
      message: "Booking created successfully",
    })
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
