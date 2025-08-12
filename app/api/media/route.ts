import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { dbOperations } from "@/lib/database";
import type { MediaRecord } from "@/lib/types";

export async function GET() {
  try {
    const media = (await dbOperations.getMedia?.()) as MediaRecord[] | undefined;
    return NextResponse.json(media ?? []);
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error fetching media:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// Minimal disk-backed upload implementation (can be swapped for Cloudinary later)
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "media");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^A-Za-z0-9._-]/g, "_")}`;
    const target = path.join(uploadsDir, safeName);
    fs.writeFileSync(target, buffer);

    // Optional DB insert if supported
    const publicUrl = `/uploads/media/${safeName}`;
    const inserted = (dbOperations as any).insertMedia?.({
      url: publicUrl,
      title: file.name,
      type: file.type?.startsWith("video/") ? "video" : "image",
    });

    return NextResponse.json({ filename: safeName, url: publicUrl, id: inserted?.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Upload failed", message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    const id = idParam ? Number(idParam) : NaN;
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Try to get row for path cleanup
    const row = (dbOperations as any).getMediaById?.(id) as { url?: string } | undefined;
    (dbOperations as any).deleteMedia?.(id);

    if (row?.url && row.url.startsWith("/uploads/media/")) {
      const p = path.join(process.cwd(), "public", row.url);
      try { fs.unlinkSync(p); } catch { /* ignore */ }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Delete failed", message }, { status: 500 });
  }
}
