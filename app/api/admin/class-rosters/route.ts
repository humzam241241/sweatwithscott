import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbOperations } from "@/lib/database";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const classInstanceId = searchParams.get("class_instance_id");

    if (classInstanceId) {
      // Get specific class roster
      const roster = dbOperations.getClassRoster(
        Number.parseInt(classInstanceId),
      );
      return NextResponse.json(roster);
    }

    if (date) {
      // Get all class rosters for a specific date
      const rosters = dbOperations.getClassRostersByDate(date);

      // Get detailed roster for each class
      const detailedRosters = rosters.map((roster) => {
        const attendees = dbOperations.getClassRoster(roster.class_instance_id);
        return {
          id: roster.class_instance_id,
          class_name: roster.class_name,
          coach: roster.coach,
          date: roster.date,
          start_time: roster.start_time,
          end_time: roster.end_time,
          max_capacity: roster.max_capacity,
          current_bookings: roster.current_bookings,
          attendees: attendees.map((attendee) => ({
            id: attendee.id,
            user_id: attendee.user_id,
            name: attendee.username,
            email: attendee.email || `${attendee.username}@example.com`,
            phone: attendee.phone || "(555) 000-0000",
            booking_status: attendee.booking_status,
            payment_status: attendee.payment_status,
            payment_method: attendee.payment_method,
            booking_date: attendee.booking_date,
            attendance_status: attendee.attendance_status,
            notes: attendee.notes || "",
          })),
          waitlist: [], // TODO: Implement waitlist
        };
      });

      return NextResponse.json(detailedRosters);
    }

    return NextResponse.json(
      { error: "Date or class_instance_id parameter required" },
      { status: 400 },
    );
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error fetching class rosters:", error);
    return NextResponse.json(
      { error: "Failed to fetch class rosters" },
      { status: 500 },
    );
  }
}
