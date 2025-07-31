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
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
