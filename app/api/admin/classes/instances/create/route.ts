import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbOperations } from "@/lib/database";

interface CreateClassInstanceRequest {
  classId: number;
  date: string;
  startTime: string;
  endTime: string;
  coachName?: string;
  maxCapacity?: number;
  status: "scheduled" | "canceled" | "completed";
}

interface SuccessResponse {
  success: true;
}

interface ErrorResponse {
  error: string;
}

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

export async function POST(request: NextRequest): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateClassInstanceRequest = await request.json();
    const { classId, date, startTime, endTime, coachName = "", maxCapacity = 20, status } = body;

    if (
      typeof classId !== "number" ||
      typeof date !== "string" ||
      typeof startTime !== "string" ||
      typeof endTime !== "string" ||
      typeof status !== "string"
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    dbOperations.createClassInstance(
      classId,
      date,
      startTime,
      endTime,
      coachName,
      maxCapacity,
      status,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating class instance:", error);
    return NextResponse.json({ error: "Failed to create class instance" }, { status: 500 });
  }
}
