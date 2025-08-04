import { NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("gym.db");

export async function GET() {
  try {
    const coaches = db
      .prepare(
        `SELECT id, name, bio, specialty, image, slug 
         FROM coaches 
         ORDER BY name ASC`
      )
      .all();

    return NextResponse.json(coaches);
  } catch (error) {
    console.error("Error fetching coaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 500 }
    );
  }
}
