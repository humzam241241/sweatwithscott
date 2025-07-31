import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    // Check if user already exists
    const existingUser = dbOperations.getUserByUsername(username)
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    // Create new user in database
    const userId = dbOperations.createUser(username, password, email)

    return NextResponse.json({
      message: "User created successfully",
      user_id: userId,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
