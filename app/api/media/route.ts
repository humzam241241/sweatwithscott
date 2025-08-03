import { NextResponse } from "next/server";
import { dbOperations } from "@/lib/database";
import type { MediaRecord } from "@/lib/types";

export async function GET() {
  try {
    const media = (await dbOperations.getMedia?.()) as MediaRecord[] | undefined;
    return NextResponse.json(media ?? []);
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json([], { status: 500 });
  }
}
