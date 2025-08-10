import { NextResponse } from "next/server";
import { dbOperations } from "@/lib/database";

interface GymClass {
  id: number;
  name: string;
  description?: string | null;
  instructor?: string | null;
  duration?: number | null;
  max_capacity?: number | null;
  price?: number | null;
  day_of_week?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  is_active?: number;
  created_at?: string;
}

export async function GET(): Promise<NextResponse<GymClass[] | { error: string }>> {
  try {
    const classes = dbOperations.getAllClasses() as GymClass[];
    return NextResponse.json(Array.isArray(classes) ? classes : []);
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error loading classes:", error);
    return NextResponse.json(
      { error: "Failed to load classes" },
      { status: 500 }
    );
  }
}
