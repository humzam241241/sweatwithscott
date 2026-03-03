import { type NextRequest, NextResponse } from "next/server"

// Mock attendance data matching the Flask database structure
const attendanceRecords = [
  {
    id: 1,
    user_id: 2,
    class_type: "Boxing",
    date: "2024-01-25",
    attended: 1,
  },
  {
    id: 2,
    user_id: 3,
    class_type: "Strength & Conditioning",
    date: "2024-01-26",
    attended: 0,
  },
  {
    id: 3,
    user_id: 4,
    class_type: "Junior Jabbers",
    date: "2024-01-27",
    attended: 1,
  },
]

export async function GET() {
  return NextResponse.json(attendanceRecords)
}

export async function POST(request: NextRequest) {
  try {
    const { bookingId, attended } = await request.json()

    // In production, update the database
    console.log(`Updating booking ${bookingId} attendance to ${attended}`)

    // Update the mock data
    const record = attendanceRecords.find((r) => r.id === bookingId)
    if (record) {
      record.attended = attended ? 1 : 0
    }

    return NextResponse.json({ message: "Attendance updated successfully" })
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 })
  }
}
