import { NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"

export async function GET() {
  try {
    const users = dbOperations.getAllUsers()

    // Transform data to match the frontend interface
    const transformedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: `${user.username}@example.com`, // Default email since not in original schema
      membershipStatus: user.is_admin === 1 ? "admin" : "active",
      totalClasses: 0, // Would need to calculate from attendance
      lastPayment: "N/A", // Would need payment data
      is_admin: user.is_admin,
    }))

    return NextResponse.json(transformedUsers)
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, suspend } = body as { userId?: number; suspend?: boolean };
    if (!userId || typeof suspend !== 'boolean') {
      return NextResponse.json({ error: 'userId and suspend required' }, { status: 400 });
    }
    // Map suspend=true to membership_status='suspended'
    dbOperations.updateUser(userId, { membership_status: suspend ? 'suspended' : 'active' });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}