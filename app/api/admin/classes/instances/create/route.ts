import { NextRequest, NextResponse } from "next/server";
import { dbOperations } from "@/lib/database";

interface CreateClassInstanceRequest {
  classId: number;
  date: string;
  startTime: string;
  endTime: string;
  coachName: string;
}

interface SuccessResponse {
  success: true;
}

interface ErrorResponse {
  error: string;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const body: CreateClassInstanceRequest = await request.json();
    const { classId, date, startTime, endTime, coachName } = body;

    if (
      typeof classId !== "number" ||
      typeof date !== "string" ||
      typeof startTime !== "string" ||
      typeof endTime !== "string" ||
      typeof coachName !== "string"
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    dbOperations.createClassInstance(
      classId,
      date,
      startTime,
      endTime,
      coachName,
      20,
      "scheduled",
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error creating class instance:", error);
    return NextResponse.json(
      { error: "Failed to create class instance" },
      { status: 500 },
    );
  }
}
