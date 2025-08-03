import { NextResponse } from "next/server";
import { dbOperations } from "@/lib/database";
import type { CoachRecord } from "@/lib/types";

export async function GET() {
  try {
    const coaches = (await dbOperations.getAllCoaches?.()) as CoachRecord[] | undefined;
    return NextResponse.json(coaches ?? []);
  } catch (error) {
    console.error("Error fetching coaches:", error);
    return NextResponse.json([], { status: 500 });
  }
}
