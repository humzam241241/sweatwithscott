import { NextRequest, NextResponse } from "next/server";
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
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error fetching settings:", error);
    return NextResponse.json({}, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const upsert = db.prepare(
      `INSERT INTO site_settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    );
    const entries = Object.entries(body as Record<string, string>);
    const tx = db.transaction((rows: Array<[string, string]>) => {
      for (const [k, v] of rows) {
        upsert.run(k, String(v ?? ""));
      }
    });
    tx(entries as Array<[string, string]>);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
