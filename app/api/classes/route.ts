import { NextResponse } from "next/server";
import type { ClassRecord } from "@/lib/types";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const classes = query<ClassRecord>(
      "SELECT id, name, description, image, slug FROM classes ORDER BY name ASC",
    );
    return NextResponse.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json([], { status: 500 });
  }
}
