import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const classes = await prisma.classTemplate.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(classes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await prisma.classTemplate.create({
    data: {
      name: body.name,
      coachName: body.coachName ?? null,
      capacityDefault: Number(body.capacityDefault ?? 20),
      rrule: body.rrule ?? "",
      isActive: true,
    },
  });
  return NextResponse.json(created, { status: 201 });
}


