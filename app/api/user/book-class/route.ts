import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { className, date, time, coach } = await request.json()

    // In production, save to database with user session
    console.log(`Booking class: ${className} on ${date} at ${time} with ${coach}`)

    return NextResponse.json({ message: "Class booked successfully" })
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    return NextResponse.json({ error: "Failed to book class" }, { status: 500 })
  }
}
