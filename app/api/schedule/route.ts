import { NextResponse } from "next/server";
import { dbOperations } from "@/lib/database";

interface ScheduleItem {
  id: number;
  class_id: number;
  class_name: string;
  date: string;
  start_time: string;
  end_time: string;
  coach_name: string;
  status: string;
}

export async function GET(): Promise<
  NextResponse<ScheduleItem[] | { error: string }>
> {
  try {
    const instances = (dbOperations as any).getAllClassInstances() as any[];
    const schedule: ScheduleItem[] = Array.isArray(instances)
      ? instances.map((instance) => ({
          id: instance.id,
          class_id: instance.class_id,
          class_name: instance.class_name,
          date: instance.date,
          start_time: instance.start_time,
          end_time: instance.end_time,
          coach_name:
            instance.coach_name || instance.instructor || instance.class_instructor,
          status: instance.status,
        }))
      : [];
    return NextResponse.json(schedule);
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Failed to load schedule" },
      { status: 500 }
    );
  }
}

