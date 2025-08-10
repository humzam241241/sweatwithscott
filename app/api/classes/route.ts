import { NextResponse } from "next/server";
import { dbOperations } from "@/lib/database";

export async function GET() {
  try {
    const classes = dbOperations.getAllClasses();
    return NextResponse.json(Array.isArray(classes) ? classes : []);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching classes:", error.message);
    } else {
      console.error("Error fetching classes:", String(error));
    }
    return NextResponse.json([], { status: 500 });
  }
}
