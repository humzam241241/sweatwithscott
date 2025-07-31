// app/api/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db'; // if that alias breaks, change to relative: ../../../../lib/db

const memberSchema = z.object({
  name: z.string().min(1)
});

export async function GET() {
  try {
    const db = getDb();
    const rows = db
      .prepare('SELECT id, name, joined_at FROM members ORDER BY joined_at DESC')
      .all();
    return NextResponse.json({ members: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = memberSchema.parse(body);
    const db = getDb();
    const insert = db.prepare('INSERT INTO members (name) VALUES (?)');
    const result = insert.run(parsed.name);
    const member = db
      .prepare('SELECT id, name, joined_at FROM members WHERE id = ?')
      .get(result.lastInsertRowid);
    return NextResponse.json({ member });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', issues: e.errors },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
