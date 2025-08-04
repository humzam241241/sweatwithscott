import { NextResponse } from "next/server";
import { dbOperations } from "@/lib/database";
import type { ClassRecord } from "@/lib/types";

export async function GET() {
  try {
    // Always call the function directly — no optional chaining
    const classes = (await dbOperations.getAllClasses()) as ClassRecord[];

    // Return an empty array if somehow no data
    return NextResponse.json(classes ?? []);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json([], { status: 500 });
  }
}
