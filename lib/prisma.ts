import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

// Ensure a valid SQLite DATABASE_URL for Prisma (especially on Windows)
function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    // If user provided a URL, keep it
    return envUrl;
  }

  // Default to an absolute file URL in the repo's prisma folder
  const dbFile = path.join(process.cwd(), "prisma", "dev.db");
  const dir = path.dirname(dbFile);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
    // Best-effort; Prisma/SQLite will error if directory truly cannot be created
  }

  const normalized = dbFile.replace(/\\/g, "/");
  const fileUrl = `file:${normalized}`;
  process.env.DATABASE_URL = fileUrl;
  return fileUrl;
}

const databaseUrl = resolveDatabaseUrl();

export const prisma: PrismaClient =
  (global.__prisma__ as PrismaClient | undefined) ??
  new PrismaClient({ datasources: { db: { url: databaseUrl } } });

if (process.env.NODE_ENV !== "production") (global as any).__prisma__ = prisma;



