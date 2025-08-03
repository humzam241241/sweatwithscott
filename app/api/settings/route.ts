import { NextResponse } from "next/server";
import db from "@/lib/database";

interface SettingRow {
  key: string;
  value: string;
}

export async function GET() {
  try {
    const rows = db
      .prepare("SELECT key, value FROM site_settings")
      .all() as SettingRow[];
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
