import { NextResponse } from "next/server";
import { dbOperations } from "@/lib/database";
import type { MembershipPackageRecord } from "@/lib/types";

export async function GET() {
  try {
    const packages = (await dbOperations.getMembershipPackages?.()) as
      | MembershipPackageRecord[]
      | undefined;
    return NextResponse.json(packages ?? []);
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error fetching membership packages:", error);
    return NextResponse.json([], { status: 500 });
  }
}
