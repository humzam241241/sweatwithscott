import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { getDb } from "@/lib/db";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function GET() {
  const items: { id?: number; src: string; type: string }[] = [];
  const publicDir = path.join(process.cwd(), "public");

  // Static images
  try {
    const imgDir = path.join(publicDir, "images");
    const files = fs.readdirSync(imgDir);
    files
      .filter((f) => /\.(jpg|png|webp)$/i.test(f) && f !== "logo.png")
      .forEach((f) => items.push({ src: `/images/${f}`, type: "image" }));
  } catch {}

  // Static videos
  try {
    const vidDir = path.join(publicDir, "videos");
    const vfiles = fs.readdirSync(vidDir);
    vfiles
      .filter((f) => /\.(mp4|webm)$/i.test(f))
      .forEach((f) => items.push({ src: `/videos/${f}`, type: "video" }));
  } catch {}

  // Uploaded media from DB
  try {
    const db = getDb();
    const rows = db
      .prepare("SELECT id, filename, type FROM media ORDER BY uploaded_at DESC")
      .all();
    rows.forEach((r) =>
      items.push({ id: r.id, src: `/uploads/media/${r.filename}`, type: r.type })
    );
  } catch (err) {
    console.error("Error loading media from DB", err);
  }

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".mp4", ".webm"];
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name}`.replace(/\s+/g, "_");
  const uploadDir = path.join(process.cwd(), "public", "uploads", "media");
  await fs.promises.mkdir(uploadDir, { recursive: true });
  await fs.promises.writeFile(path.join(uploadDir, filename), buffer);
  const type = [".mp4", ".webm"].includes(ext) ? "video" : "image";

  const db = getDb();
  const info = db
    .prepare("INSERT INTO media (filename, type) VALUES (?, ?)")
    .run(filename, type);

  return NextResponse.json({ id: info.lastInsertRowid, filename, type });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const db = getDb();
  const row = db.prepare("SELECT filename FROM media WHERE id = ?").get(id);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const filePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "media",
    row.filename
  );
  try {
    await fs.promises.unlink(filePath);
  } catch {}
  db.prepare("DELETE FROM media WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}

